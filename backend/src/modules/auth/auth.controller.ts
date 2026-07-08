import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  async register(@Body() dto: any) {
    return this.authService.register(dto);
  }

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Login with email and password' })
  async login(@Body() dto: any, @Req() req: any) {
    return this.authService.login({ ...dto, ip: req.ip, userAgent: req.headers['user-agent'] });
  }

  @Public()
  @Post('google')
  @ApiOperation({ summary: 'Login with Google' })
  async googleLogin(@Body('accessToken') token: string) {
    return { message: 'Use /api/auth/google/callback for OAuth flow' };
  }

  @Public()
  @Post('github')
  @ApiOperation({ summary: 'Login with GitHub' })
  async githubLogin(@Body('code') code: string) {
    return { message: 'Use /api/auth/github/callback for OAuth flow' };
  }

  @Public()
  @Post('discord')
  @ApiOperation({ summary: 'Login with Discord' })
  async discordLogin(@Body('code') code: string) {
    return { message: 'Use /api/auth/discord/callback for OAuth flow' };
  }

  @Public()
  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  async refreshToken(@Body('refreshToken') refreshToken: string) {
    return this.authService.refreshToken(refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Post('logout')
  @ApiOperation({ summary: 'Logout user' })
  async logout(
    @CurrentUser('id') userId: string,
    @Body('refreshToken') refreshToken?: string,
  ) {
    return this.authService.logout(userId, refreshToken);
  }

  @Public()
  @Get('verify-email')
  @ApiOperation({ summary: 'Verify email address' })
  async verifyEmail(@Query('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  @Public()
  @Post('forgot-password')
  @ApiOperation({ summary: 'Request password reset' })
  async forgotPassword(@Body('email') email: string) {
    return this.authService.forgotPassword(email);
  }

  @Public()
  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password with token' })
  async resetPassword(
    @Body('token') token: string,
    @Body('password') password: string,
  ) {
    return this.authService.resetPassword(token, password);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Post('2fa/setup')
  @ApiOperation({ summary: 'Setup two-factor authentication' })
  async setupTwoFactor(@CurrentUser('id') userId: string) {
    return this.authService.setupTwoFactor(userId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Post('2fa/verify')
  @ApiOperation({ summary: 'Verify and enable two-factor authentication' })
  async verifyTwoFactor(
    @CurrentUser('id') userId: string,
    @Body('token') token: string,
  ) {
    return this.authService.verifyTwoFactorSetup(userId, token);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Post('2fa/disable')
  @ApiOperation({ summary: 'Disable two-factor authentication' })
  async disableTwoFactor(
    @CurrentUser('id') userId: string,
    @Body('password') password: string,
  ) {
    return this.authService.disableTwoFactor(userId, password);
  }
}
