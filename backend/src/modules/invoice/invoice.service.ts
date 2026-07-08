import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class InvoiceService {
  constructor(private readonly prisma: PrismaService) {}

  async generateInvoice(userId: string, dto: { amount: number; currency?: string; description?: string; items?: any[] }) {
    const number = `INV-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    return this.prisma.invoice.create({
      data: {
        userId, number, amount: dto.amount, currency: dto.currency || 'USD',
        status: 'PENDING', description: dto.description, items: dto.items || [],
        dueDate: new Date(Date.now() + 30 * 86400000),
      },
    });
  }

  async getAll(page = 1, limit = 20) {
    const [data, total] = await Promise.all([
      this.prisma.invoice.findMany({ orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit, include: { user: { select: { id: true, email: true, name: true } } } }),
      this.prisma.invoice.count(),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async getById(id: string) { return this.prisma.invoice.findUnique({ where: { id }, include: { payments: true, user: { select: { id: true, email: true, name: true } } } }); }

  async markAsPaid(id: string) {
    return this.prisma.invoice.update({ where: { id }, data: { status: 'SUCCESS', paidAt: new Date() } });
  }
}
