import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: {
    page?: number;
    limit?: number;
    role?: string;
    status?: string;
    search?: string;
  }) {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 10, 100);
    const skip = (page - 1) * limit;

    const where: any = { deletedAt: null };

    if (query.role) where.role = query.role;
    if (query.status) where.status = query.status;
    if (query.search) {
      where.OR = [
        { email: { contains: query.search, mode: 'insensitive' } },
        { name: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
          role: true,
          status: true,
          emailVerified: true,
          twoFactorEnabled: true,
          lastLoginAt: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPreviousPage: page > 1,
      },
    };
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        role: true,
        status: true,
        emailVerified: true,
        twoFactorEnabled: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateProfile(userId: string, dto: { name?: string; avatar?: string }) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: dto,
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        role: true,
        status: true,
      },
    });

    return user;
  }

  async updateRole(targetUserId: string, role: string, requesterId: string) {
    const requester = await this.prisma.user.findUnique({ where: { id: requesterId } });
    if (!requester || (requester.role !== 'SUPER_ADMIN' && requester.role !== 'ADMIN')) {
      throw new ForbiddenException('Insufficient permissions');
    }

    const user = await this.prisma.user.update({
      where: { id: targetUserId },
      data: { role: role as any },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
      },
    });

    this.logger.log(`User ${targetUserId} role updated to ${role} by ${requesterId}`);
    return user;
  }

  async updateStatus(targetUserId: string, status: string, requesterId: string) {
    const requester = await this.prisma.user.findUnique({ where: { id: requesterId } });
    if (!requester || requester.role !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Only super admins can change user status');
    }

    const user = await this.prisma.user.update({
      where: { id: targetUserId },
      data: { status: status as any },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
      },
    });

    this.logger.log(`User ${targetUserId} status updated to ${status} by ${requesterId}`);
    return user;
  }

  async deleteUser(targetUserId: string, requesterId: string) {
    const requester = await this.prisma.user.findUnique({ where: { id: requesterId } });
    if (!requester || requester.role !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Only super admins can delete users');
    }

    await this.prisma.user.update({
      where: { id: targetUserId },
      data: { deletedAt: new Date() },
    });

    this.logger.log(`User ${targetUserId} soft-deleted by ${requesterId}`);
    return { message: 'User deleted successfully' };
  }
}
