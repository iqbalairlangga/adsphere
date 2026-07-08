import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class BillingService {
  constructor(private readonly prisma: PrismaService) {}

  async getBillingHistory(userId: string, page = 1, limit = 10) {
    const where = { userId };
    const [invoices, total] = await Promise.all([
      this.prisma.invoice.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit }),
      this.prisma.invoice.count({ where }),
    ]);
    return { data: invoices, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async getInvoice(invoiceId: string) {
    return this.prisma.invoice.findUnique({ where: { id: invoiceId }, include: { payments: true } });
  }

  async getUsageSummary(userId: string) {
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const [impressions, clicks] = await Promise.all([
      this.prisma.adImpression.count({ where: { createdAt: { gte: startOfMonth }, advertisement: { campaign: { userId } } } }),
      this.prisma.adClick.count({ where: { createdAt: { gte: startOfMonth }, advertisement: { campaign: { userId } } } }),
    ]);
    return { impressions, clicks, period: { start: startOfMonth, end: new Date() } };
  }
}
