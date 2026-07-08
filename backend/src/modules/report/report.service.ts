import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ReportService {
  constructor(private readonly prisma: PrismaService) {}

  async generateCampaignReport(campaignId: string) {
    const campaign = await this.prisma.campaign.findUnique({ where: { id: campaignId }, include: { advertisements: true } });
    if (!campaign) throw new Error('Campaign not found');

    const impressions = await this.prisma.adImpression.aggregate({ where: { advertisement: { campaignId } }, _count: { id: true }, _sum: { cost: true, revenue: true } });
    const clicks = await this.prisma.adClick.count({ where: { advertisement: { campaignId } } });
    const conversions = await this.prisma.conversion.count({ where: { campaignId } });

    return { campaign: { name: campaign.name, status: campaign.status, budget: Number(campaign.budget), spent: Number(campaign.spent) }, metrics: { impressions: impressions._count.id, clicks, conversions, cost: Number(impressions._sum.cost || 0), revenue: Number(impressions._sum.revenue || 0) } };
  }

  async generatePublisherReport(publisherId: string) {
    const websites = await this.prisma.publisherWebsite.findMany({ where: { userId: publisherId }, select: { id: true, domain: true } });
    return { publisherId, websites };
  }

  async generateSystemReport() {
    const [users, campaigns, payments, impressions] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.campaign.count(),
      this.prisma.payment.aggregate({ _sum: { amount: true } }),
      this.prisma.adImpression.aggregate({ _count: { id: true }, _sum: { revenue: true } }),
    ]);

    return { totalUsers: users, totalCampaigns: campaigns, totalRevenue: Number(payments._sum.amount || 0), totalImpressions: impressions._count.id, adRevenue: Number(impressions._sum.revenue || 0) };
  }
}
