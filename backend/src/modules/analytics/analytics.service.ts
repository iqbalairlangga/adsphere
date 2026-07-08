import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../redis/redis.service';
import * as csvStringify from 'csv-stringify/sync';
import * as ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async getDashboardStats(userId: string, dateRange?: { start: Date; end: Date }, role?: string) {
    const start = dateRange?.start || new Date(new Date().setDate(new Date().getDate() - 30));
    const end = dateRange?.end || new Date();

    const whereBase = role === 'PUBLISHER'
      ? { publisherId: userId }
      : role === 'ADVERTISER'
      ? { campaign: { userId } }
      : {};

    const whereTime = { createdAt: { gte: start, lte: end } };

    const [impressions, clicks, conversions, revenueData] = await Promise.all([
      this.prisma.adImpression.count({ where: { ...whereTime, ...whereBase } }),
      this.prisma.adClick.count({ where: { ...whereTime, ...whereBase } }),
      this.prisma.conversion.count({ where: { ...whereTime, ...whereBase } }),
      this.prisma.adImpression.aggregate({
        where: { ...whereTime, ...whereBase },
        _sum: { revenue: true, cost: true },
      }),
    ]);

    const totalRevenue = Number(revenueData._sum.revenue || 0);
    const totalCost = Number(revenueData._sum.cost || 0);
    const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
    const cpm = impressions > 0 ? (totalCost / impressions) * 1000 : 0;
    const cpc = clicks > 0 ? totalCost / clicks : 0;
    const roi = totalCost > 0 ? ((totalRevenue - totalCost) / totalCost) * 100 : 0;

    return {
      impressions,
      clicks,
      conversions,
      revenue: totalRevenue,
      cost: totalCost,
      profit: totalRevenue - totalCost,
      ctr: Number(ctr.toFixed(2)),
      cpm: Number(cpm.toFixed(2)),
      cpc: Number(cpc.toFixed(4)),
      cpa: conversions > 0 ? Number((totalCost / conversions).toFixed(2)) : 0,
      roi: Number(roi.toFixed(2)),
      period: { start, end },
    };
  }

  async getRealtimeStats(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [todayImp, todayClicks, activeCampaigns] = await Promise.all([
      this.prisma.adImpression.count({
        where: { createdAt: { gte: today }, advertisement: { campaign: { userId } } },
      }),
      this.prisma.adClick.count({
        where: { createdAt: { gte: today }, advertisement: { campaign: { userId } } },
      }),
      this.prisma.campaign.count({
        where: { userId, status: 'ACTIVE' },
      }),
    ]);

    const liveUsers = await this.redis.get(`realtime:users:${userId}`) || '0';

    return {
      todayImpressions: todayImp,
      todayClicks: todayClicks,
      activeCampaigns,
      liveUsers: parseInt(liveUsers),
      ctr: todayImp > 0 ? Number(((todayClicks / todayImp) * 100).toFixed(2)) : 0,
    };
  }

  async getChartData(userId: string, period: '7d' | '30d' | '90d' | '1y', metric: string) {
    const days = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 365;
    const start = new Date(new Date().setDate(new Date().getDate() - days));

    const impressions = await this.prisma.adImpression.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: { gte: start },
        advertisement: { campaign: { userId } },
      },
      _count: { id: true },
      _sum: { revenue: true, cost: true },
    });

    const dailyMap = new Map<string, { impressions: number; clicks: number; revenue: number; cost: number }>();

    for (let i = 0; i < days; i++) {
      const date = new Date(new Date().setDate(new Date().getDate() - i));
      const key = date.toISOString().split('T')[0];
      dailyMap.set(key, { impressions: 0, clicks: 0, revenue: 0, cost: 0 });
    }

    impressions.forEach((imp) => {
      const key = imp.createdAt.toISOString().split('T')[0];
      const existing = dailyMap.get(key);
      if (existing) {
        existing.impressions += imp._count.id;
        existing.revenue += Number(imp._sum.revenue || 0);
        existing.cost += Number(imp._sum.cost || 0);
      }
    });

    const clicks = await this.prisma.adClick.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: { gte: start },
        advertisement: { campaign: { userId } },
      },
      _count: { id: true },
    });

    clicks.forEach((clk) => {
      const key = clk.createdAt.toISOString().split('T')[0];
      const existing = dailyMap.get(key);
      if (existing) {
        existing.clicks += clk._count.id;
      }
    });

    const chartData = Array.from(dailyMap.entries())
      .map(([date, data]) => ({
        date,
        ...data,
        ctr: data.impressions > 0 ? Number(((data.clicks / data.impressions) * 100).toFixed(2)) : 0,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return { period, metric, data: chartData };
  }

  async getCampaignAnalytics(campaignId: string) {
    const [impressions, clicks, conversions] = await Promise.all([
      this.prisma.adImpression.aggregate({
        where: { advertisement: { campaignId } },
        _count: { id: true },
        _sum: { revenue: true, cost: true },
      }),
      this.prisma.adClick.count({
        where: { advertisement: { campaignId } },
      }),
      this.prisma.conversion.count({
        where: { campaignId },
      }),
    ]);

    const totalImp = impressions._count.id;
    const totalRev = Number(impressions._sum.revenue || 0);
    const totalCost = Number(impressions._sum.cost || 0);

    return {
      impressions: totalImp,
      clicks,
      conversions,
      revenue: totalRev,
      cost: totalCost,
      ctr: totalImp > 0 ? Number(((clicks / totalImp) * 100).toFixed(2)) : 0,
      cpc: clicks > 0 ? Number((totalCost / clicks).toFixed(4)) : 0,
      cpm: totalImp > 0 ? Number((totalCost / totalImp * 1000).toFixed(2)) : 0,
      cpa: conversions > 0 ? Number((totalCost / conversions).toFixed(2)) : 0,
    };
  }

  async exportCsv(userId: string, dateRange: { start: Date; end: Date }) {
    const data = await this.getChartData(userId, '30d', 'impressions');
    const rows = data.data.map((d) => ({
      Date: d.date,
      Impressions: d.impressions,
      Clicks: d.clicks,
      Revenue: d.revenue,
      Cost: d.cost,
      CTR: d.ctr,
    }));

    return csvStringify.stringify(rows, { header: true });
  }

  async exportExcel(userId: string, dateRange: { start: Date; end: Date }) {
    const data = await this.getChartData(userId, '30d', 'impressions');
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Analytics');

    sheet.columns = [
      { header: 'Date', key: 'date', width: 15 },
      { header: 'Impressions', key: 'impressions', width: 15 },
      { header: 'Clicks', key: 'clicks', width: 10 },
      { header: 'Revenue', key: 'revenue', width: 12 },
      { header: 'Cost', key: 'cost', width: 12 },
      { header: 'CTR (%)', key: 'ctr', width: 10 },
    ];

    data.data.forEach((row) => sheet.addRow(row));

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  }

  async exportPdf(userId: string, dateRange: { start: Date; end: Date }): Promise<Buffer> {
    const stats = await this.getDashboardStats(userId, dateRange);
    return new Promise((resolve) => {
      const doc = new PDFDocument({ margin: 50 });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));

      doc.fontSize(20).text('AdSphere Analytics Report', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(`Period: ${dateRange.start.toISOString().split('T')[0]} to ${dateRange.end.toISOString().split('T')[0]}`);
      doc.moveDown(2);

      const metrics = [
        ['Impressions', stats.impressions.toString()],
        ['Clicks', stats.clicks.toString()],
        ['Conversions', stats.conversions.toString()],
        ['CTR', `${stats.ctr}%`],
        ['CPM', `$${stats.cpm}`],
        ['CPC', `$${stats.cpc}`],
        ['Revenue', `$${stats.revenue}`],
        ['Cost', `$${stats.cost}`],
        ['ROI', `${stats.roi}%`],
      ];

      metrics.forEach(([label, value]) => {
        doc.fontSize(10).text(`${label}: ${value}`, { continued: false });
      });

      doc.end();
    });
  }
}
