import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async get(key: string) {
    const setting = await this.prisma.setting.findUnique({ where: { key } });
    return setting ? setting.value : null;
  }

  async set(key: string, value: any, group = 'general', type = 'string', description?: string) {
    return this.prisma.setting.upsert({
      where: { key },
      create: { key, value, group, type, description },
      update: { value, group, type, description },
    });
  }

  async getGroup(group: string) {
    return this.prisma.setting.findMany({ where: { group } });
  }

  async getAll() {
    return this.prisma.setting.findMany({ orderBy: { group: 'asc' } });
  }

  async delete(key: string) {
    await this.prisma.setting.delete({ where: { key } });
    return { message: 'Setting deleted' };
  }
}
