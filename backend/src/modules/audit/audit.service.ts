import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async log(dto: {
    userId?: string;
    action: string;
    resource: string;
    resourceId?: string;
    details?: any;
    ip?: string;
    userAgent?: string;
    severity?: string;
  }) {
    return this.prisma.auditLog.create({
      data: {
        userId: dto.userId,
        action: dto.action as any,
        resource: dto.resource,
        resourceId: dto.resourceId,
        details: dto.details || {},
        ip: dto.ip,
        userAgent: dto.userAgent,
        severity: dto.severity || 'info',
      },
    });
  }

  async findAll(query: {
    page?: number;
    limit?: number;
    userId?: string;
    action?: string;
    resource?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 20, 100);
    const skip = (page - 1) * limit;
    const where: any = {};

    if (query.userId) where.userId = query.userId;
    if (query.action) where.action = query.action;
    if (query.resource) where.resource = query.resource;
    if (query.startDate || query.endDate) {
      where.createdAt = {};
      if (query.startDate) where.createdAt.gte = new Date(query.startDate);
      if (query.endDate) where.createdAt.lte = new Date(query.endDate);
    }

    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { id: true, email: true, name: true } } },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      data: logs,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }
}
