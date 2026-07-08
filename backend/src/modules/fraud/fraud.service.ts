import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class FraudService {
  private readonly logger = new Logger(FraudService.name);

  constructor(private readonly prisma: PrismaService) {}

  async checkImpression(impression: { ip: string; userAgent: string; advertisementId: string }): Promise<{ isFraud: boolean; score: number; reasons: string[] }> {
    const reasons: string[] = [];
    let score = 0;

    const recentCount = await this.prisma.adImpression.count({
      where: {
        ip: impression.ip,
        createdAt: { gte: new Date(Date.now() - 1000) },
      },
    });

    if (recentCount > 10) {
      score += 0.5;
      reasons.push('High velocity impressions from same IP');
    }

    const duplicate = await this.prisma.adImpression.findFirst({
      where: {
        advertisementId: impression.advertisementId,
        ip: impression.ip,
        createdAt: { gte: new Date(Date.now() - 60000) },
      },
    });

    if (duplicate) {
      score += 0.3;
      reasons.push('Duplicate impression');
    }

    const botPatterns = /bot|crawler|spider|scraper|curl|wget|python|headless/i;
    if (botPatterns.test(impression.userAgent)) {
      score += 0.8;
      reasons.push('Bot user agent detected');
    }

    const isFraud = score >= 0.5;

    if (isFraud) {
      await this.prisma.fraudDetection.create({
        data: {
          type: 'IMPRESSION',
          score,
          severity: score >= 0.8 ? 'CRITICAL' : score >= 0.6 ? 'HIGH' : 'MEDIUM',
          status: 'INVESTIGATING',
          details: { reasons, ip: impression.ip, userAgent: impression.userAgent },
          ip: impression.ip,
          userAgent: impression.userAgent,
        },
      });

      this.logger.warn(`Fraud detected: score=${score}, ip=${impression.ip}`);
    }

    return { isFraud, score, reasons };
  }

  async getFraudDetections(query: { page?: number; limit?: number; status?: string; severity?: string }) {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 20, 100);
    const where: any = {};

    if (query.status) where.status = query.status;
    if (query.severity) where.severity = query.severity;

    const [data, total] = await Promise.all([
      this.prisma.fraudDetection.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { detectedAt: 'desc' },
      }),
      this.prisma.fraudDetection.count({ where }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async updateStatus(detectionId: string, status: string, resolvedBy: string) {
    return this.prisma.fraudDetection.update({
      where: { id: detectionId },
      data: { status: status as any, resolvedAt: status === 'RESOLVED' ? new Date() : null, resolvedBy },
    });
  }
}
