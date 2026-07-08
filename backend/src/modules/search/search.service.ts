import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  async search(query: string, type: 'all' | 'campaigns' | 'users' | 'ads' = 'all', page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const results: any = {};

    if (type === 'all' || type === 'campaigns') {
      results.campaigns = await this.prisma.campaign.findMany({
        where: { name: { contains: query, mode: 'insensitive' }, deletedAt: null },
        skip, take: limit,
      });
    }

    if (type === 'all' || type === 'users') {
      results.users = await this.prisma.user.findMany({
        where: { OR: [{ email: { contains: query, mode: 'insensitive' } }, { name: { contains: query, mode: 'insensitive' } }], deletedAt: null },
        skip, take: limit,
        select: { id: true, email: true, name: true, role: true, avatar: true },
      });
    }

    if (type === 'all' || type === 'ads') {
      results.ads = await this.prisma.advertisement.findMany({
        where: { OR: [{ name: { contains: query, mode: 'insensitive' } }, { title: { contains: query, mode: 'insensitive' } }], deletedAt: null },
        skip, take: limit,
      });
    }

    return results;
  }
}
