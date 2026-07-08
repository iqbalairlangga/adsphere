import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.role.findMany({
      include: {
        permissions: {
          include: { permission: true },
        },
        _count: { select: { users: true } },
      },
    });
  }

  async findById(id: string) {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: {
        permissions: { include: { permission: true } },
        users: { include: { user: { select: { id: true, email: true, name: true } } } },
      },
    });
    if (!role) throw new NotFoundException('Role not found');
    return role;
  }

  async create(dto: { name: string; description?: string; permissionIds?: string[] }) {
    const existing = await this.prisma.role.findUnique({ where: { name: dto.name } });
    if (existing) throw new ConflictException('Role already exists');

    return this.prisma.role.create({
      data: {
        name: dto.name,
        description: dto.description,
        permissions: dto.permissionIds
          ? { create: dto.permissionIds.map((pid) => ({ permissionId: pid })) }
          : undefined,
      },
      include: { permissions: { include: { permission: true } } },
    });
  }

  async update(id: string, dto: { name?: string; description?: string; permissionIds?: string[] }) {
    const role = await this.prisma.role.findUnique({ where: { id } });
    if (!role) throw new NotFoundException('Role not found');

    if (dto.permissionIds) {
      await this.prisma.rolePermission.deleteMany({ where: { roleId: id } });
      await this.prisma.rolePermission.createMany({
        data: dto.permissionIds.map((pid) => ({ roleId: id, permissionId: pid })),
      });
    }

    return this.prisma.role.update({
      where: { id },
      data: { name: dto.name, description: dto.description },
      include: { permissions: { include: { permission: true } } },
    });
  }

  async delete(id: string) {
    const role = await this.prisma.role.findUnique({ where: { id } });
    if (!role) throw new NotFoundException('Role not found');
    if (role.isSystem) throw new ConflictException('Cannot delete system role');

    await this.prisma.role.delete({ where: { id } });
    return { message: 'Role deleted' };
  }

  async assignRole(userId: string, roleId: string, assignedBy: string) {
    return this.prisma.userRoleAssignment.create({
      data: { userId, roleId, assignedBy },
      include: { role: true, user: { select: { id: true, email: true, name: true } } },
    });
  }

  async removeRole(userId: string, roleId: string) {
    await this.prisma.userRoleAssignment.deleteMany({
      where: { userId, roleId },
    });
    return { message: 'Role removed from user' };
  }
}
