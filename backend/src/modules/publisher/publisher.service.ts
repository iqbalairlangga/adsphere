import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PublisherService {
  constructor(private readonly prisma: PrismaService) {}

  async createWebsite(userId: string, dto: { domain: string; name: string; description?: string; category?: string }) {
    return this.prisma.publisherWebsite.create({
      data: { userId, ...dto },
    });
  }

  async getWebsites(userId: string) {
    return this.prisma.publisherWebsite.findMany({
      where: { userId },
      include: { _count: { select: { adUnits: true } } },
    });
  }

  async getWebsite(id: string) {
    const website = await this.prisma.publisherWebsite.findUnique({
      where: { id },
      include: { adUnits: true },
    });
    if (!website) throw new NotFoundException('Website not found');
    return website;
  }

  async createAdUnit(websiteId: string, dto: { name: string; type: string; width?: number; height?: number }) {
    return this.prisma.adUnit.create({
      data: { websiteId, ...dto } as any,
    });
  }

  async getAdUnits(websiteId: string) {
    return this.prisma.adUnit.findMany({
      where: { websiteId },
      include: { _count: { select: { adPlacements: true } } },
    });
  }

  async getPublisherEarnings(userId: string) {
    const impressions = await this.prisma.adImpression.aggregate({
      where: {},
      _sum: { revenue: true },
    });
    return { totalEarnings: Number(impressions._sum.revenue || 0) };
  }
}
