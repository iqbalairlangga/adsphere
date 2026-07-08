import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../constants';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    if (user.role === 'SUPER_ADMIN') {
      return true;
    }

    const userPermissions = await this.prisma.rolePermission.findMany({
      where: {
        role: {
          users: {
            some: { userId: user.id },
          },
        },
      },
      include: { permission: true },
    });

    const userPermissionNames = userPermissions.map((rp) => rp.permission.name);

    const hasAllPermissions = requiredPermissions.every((perm) =>
      userPermissionNames.includes(perm),
    );

    if (!hasAllPermissions) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}
