import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../redis/redis.service';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async create(dto: {
    userId: string;
    type: string;
    title: string;
    message?: string;
    data?: any;
  }) {
    const notification = await this.prisma.notification.create({
      data: {
        userId: dto.userId,
        type: dto.type as any,
        title: dto.title,
        message: dto.message,
        data: dto.data || {},
      },
    });

    await this.redis.publish(
      `notifications:${dto.userId}`,
      JSON.stringify(notification),
    );

    return notification;
  }

  async findAll(userId: string, page = 1, limit = 20, unreadOnly = false) {
    const where: any = { userId };
    if (unreadOnly) where.read = false;

    const [notifications, total, unreadCount] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.notification.count({ where }),
      this.prisma.notification.count({ where: { userId, read: false } }),
    ]);

    return {
      data: notifications,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit), unreadCount },
    };
  }

  async markAsRead(notificationId: string, userId: string) {
    return this.prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { read: true, readAt: new Date() },
    });
  }

  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true, readAt: new Date() },
    });
  }

  async delete(notificationId: string, userId: string) {
    return this.prisma.notification.deleteMany({
      where: { id: notificationId, userId },
    });
  }

  async broadcast(type: string, title: string, message?: string) {
    const users = await this.prisma.user.findMany({
      where: { status: 'ACTIVE' },
      select: { id: true },
    });

    for (const user of users) {
      await this.create({ userId: user.id, type, title, message });
    }

    this.logger.log(`Broadcast notification sent to ${users.length} users`);
  }
}
