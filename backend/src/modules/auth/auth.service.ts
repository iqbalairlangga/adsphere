import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../redis/redis.service';
import { hashPassword, comparePassword } from '../../common/utils/password.utils';
import { generateToken } from '../../common/utils/crypto.utils';
import { hashToken } from '../../common/utils/crypto.utils';
import { v4 as uuid } from 'uuid';
import * as speakeasy from 'speakeasy';
import * as qrcode from 'qrcode';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
  ) {}

  async register(dto: { email: string; password: string; name?: string }) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await hashPassword(dto.password);
    const verifyToken = generateToken(32);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        name: dto.name,
        emailVerifyToken: verifyToken,
        role: 'ADVERTISER',
        status: 'PENDING',
      },
    });

    await this.redisService.set(
      `verify:${verifyToken}`,
      user.id,
      86400,
    );

    this.logger.log(`User registered: ${user.email} (${user.id})`);

    return {
      message: 'Registration successful. Please verify your email.',
      userId: user.id,
    };
  }

  async login(dto: { email: string; password: string; twoFactorCode?: string; ip?: string; userAgent?: string }) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { wallet: true },
    });

    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.status !== 'ACTIVE' && user.status !== 'PENDING') {
      throw new UnauthorizedException(`Account is ${user.status.toLowerCase()}`);
    }

    const isValid = await comparePassword(dto.password, user.password);
    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.twoFactorEnabled) {
      if (!dto.twoFactorCode) {
        return {
          requiresTwoFactor: true,
          userId: user.id,
          message: 'Two-factor authentication code required',
        };
      }

      const verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret!,
        encoding: 'base32',
        token: dto.twoFactorCode,
      });

      if (!verified) {
        throw new UnauthorizedException('Invalid two-factor code');
      }
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role);

    await this.redisService.set(
      `refresh:${hashToken(tokens.refreshToken)}`,
      user.id,
      7 * 86400,
    );

    await this.prisma.loginHistory.create({
      data: {
        userId: user.id,
        ip: dto['ip'] || 'unknown',
        userAgent: dto['userAgent'],
        provider: 'local',
        success: true,
      },
    });

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  async googleLogin(profile: any) {
    return this.handleOAuthLogin('google', profile);
  }

  async githubLogin(profile: any) {
    return this.handleOAuthLogin('github', profile);
  }

  async discordLogin(profile: any) {
    return this.handleOAuthLogin('discord', profile);
  }

  private async handleOAuthLogin(provider: string, profile: any) {
    const email = profile.emails?.[0]?.value || profile.email;
    if (!email) {
      throw new BadRequestException('Email not provided by OAuth provider');
    }

    let user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email,
          name: profile.displayName || profile.username,
          avatar: profile.photos?.[0]?.value,
          emailVerified: true,
          role: 'ADVERTISER',
          status: 'ACTIVE',
        },
      });
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role);

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('auth.jwtRefreshSecret'),
      });

      const storedUserId = await this.redisService.get(
        `refresh:${hashToken(refreshToken)}`,
      );

      if (!storedUserId || storedUserId !== payload.sub) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      await this.redisService.del(`refresh:${hashToken(refreshToken)}`);

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user || user.status !== 'ACTIVE') {
        throw new UnauthorizedException('User not found or inactive');
      }

      const tokens = await this.generateTokens(user.id, user.email, user.role);

      await this.redisService.set(
        `refresh:${hashToken(tokens.refreshToken)}`,
        user.id,
        7 * 86400,
      );

      return tokens;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async logout(userId: string, refreshToken?: string) {
    if (refreshToken) {
      await this.redisService.del(`refresh:${hashToken(refreshToken)}`);
    }

    await this.prisma.loginHistory.create({
      data: {
        userId,
        ip: 'unknown',
        provider: 'local',
        success: true,
      },
    });

    return { message: 'Logged out successfully' };
  }

  async verifyEmail(token: string) {
    const userId = await this.redisService.get(`verify:${token}`);
    if (!userId) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        emailVerified: true,
        emailVerifyToken: null,
        status: 'ACTIVE',
      },
    });

    await this.redisService.del(`verify:${token}`);

    return { message: 'Email verified successfully' };
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      return { message: 'If the email exists, a reset link has been sent' };
    }

    const resetToken = generateToken(32);
    await this.redisService.set(
      `reset:${resetToken}`,
      user.id,
      3600,
    );

    this.logger.log(`Password reset requested for ${email}`);

    return { message: 'If the email exists, a reset link has been sent' };
  }

  async resetPassword(token: string, newPassword: string) {
    const userId = await this.redisService.get(`reset:${token}`);
    if (!userId) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const hashedPassword = await hashPassword(newPassword);

    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    await this.redisService.del(`reset:${token}`);

    return { message: 'Password reset successfully' };
  }

  async setupTwoFactor(userId: string) {
    const secret = speakeasy.generateSecret({
      name: `AdSphere:${userId}`,
    });

    await this.prisma.user.update({
      where: { id: userId },
      data: { twoFactorSecret: secret.base32 },
    });

    const qrCode = await qrcode.toDataURL(secret.otpauth_url!);

    return {
      secret: secret.base32,
      qrCode,
      otpauthUrl: secret.otpauth_url,
    };
  }

  async verifyTwoFactorSetup(userId: string, token: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.twoFactorSecret) {
      throw new BadRequestException('2FA not initialized');
    }

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token,
    });

    if (!verified) {
      throw new BadRequestException('Invalid verification code');
    }

    const backupCodes = Array.from({ length: 8 }, () => generateToken(4));

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorEnabled: true,
        twoFactorBackupCodes: backupCodes,
      },
    });

    return {
      message: 'Two-factor authentication enabled',
      backupCodes,
    };
  }

  async disableTwoFactor(userId: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.password) {
      throw new BadRequestException('User not found');
    }

    const isValid = await comparePassword(password, user.password);
    if (!isValid) {
      throw new UnauthorizedException('Invalid password');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null,
        twoFactorBackupCodes: [],
      },
    });

    return { message: 'Two-factor authentication disabled' };
  }

  private async generateTokens(userId: string, email: string, role: string) {
    const payload = { sub: userId, email, role };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('auth.jwtSecret'),
      expiresIn: this.configService.get<string>('auth.jwtExpiresIn', '15m'),
    } as any);

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('auth.jwtRefreshSecret'),
      expiresIn: this.configService.get<string>('auth.jwtRefreshExpiresIn', '7d'),
    } as any);

    return { accessToken, refreshToken };
  }

  private sanitizeUser(user: any) {
    const { password, twoFactorSecret, twoFactorBackupCodes, emailVerifyToken, ...safe } = user;
    return safe;
  }
}
