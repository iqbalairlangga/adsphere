import {
  Injectable, NotFoundException, BadRequestException,
  ForbiddenException, Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../redis/redis.service';
import { CampaignStatus, CampaignType, UserRole } from '../../common/constants';
import { Prisma } from '@prisma/client';

@Injectable()
export class CampaignService {
  private readonly logger = new Logger(CampaignService.name);
  private readonly CACHE_TTL = 300;

  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
  ) {}

  private async verifyAccess(userId: string, userRole: string, campaignUserId: string): Promise<void> {
    if (campaignUserId !== userId && userRole !== UserRole.SUPER_ADMIN && userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('Access denied to this campaign');
    }
  }

  async create(userId: string, dto: any) {
    if (dto.startDate && dto.endDate) {
      const start = new Date(dto.startDate);
      const end = new Date(dto.endDate);
      if (end <= start) {
        throw new BadRequestException('End date must be after start date');
      }
    }

    if (dto.dailyBudget && dto.dailyBudget > dto.budget) {
      throw new BadRequestException('Daily budget cannot exceed total budget');
    }

    const campaign = await this.prisma.campaign.create({
      data: {
        userId,
        name: dto.name,
        description: dto.description,
        type: (dto.type as CampaignType) || CampaignType.DISPLAY,
        budget: new Prisma.Decimal(dto.budget),
        dailyBudget: dto.dailyBudget != null ? new Prisma.Decimal(dto.dailyBudget) : null,
        startDate: dto.startDate ? new Date(dto.startDate) : new Date(),
        endDate: dto.endDate ? new Date(dto.endDate) : null,
        targeting: dto.targeting || Prisma.JsonNull,
        schedule: dto.schedule || Prisma.JsonNull,
        utmSource: dto.utmSource,
        utmMedium: dto.utmMedium,
        utmCampaign: dto.utmCampaign,
        isATestEnabled: dto.isATestEnabled ?? false,
        status: CampaignStatus.DRAFT,
      },
      include: {
        _count: {
          select: { advertisements: true, conversions: true },
        },
      },
    });

    await this.redisService.del(`campaigns:user:${userId}`);
    this.logger.log(`Campaign created: ${campaign.name} by user ${userId}`);
    return campaign;
  }

  async findAll(userId: string, userRole: string, query: any) {
    const {
      search, status, type, page = 1, limit = 10,
      sortBy = 'createdAt', sortOrder = 'DESC' as 'ASC' | 'DESC',
      startDate, endDate,
    } = query;

    const where: Prisma.CampaignWhereInput = {};

    if (userRole !== UserRole.SUPER_ADMIN && userRole !== UserRole.ADMIN) {
      where.userId = userId;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (status) where.status = status as CampaignStatus;
    if (type) where.type = type as CampaignType;

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) (where.createdAt as any).gte = new Date(startDate);
      if (endDate) (where.createdAt as any).lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;

    const [campaigns, total] = await Promise.all([
      this.prisma.campaign.findMany({
        where,
        include: {
          _count: {
            select: { advertisements: true, conversions: true },
          },
        },
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      this.prisma.campaign.count({ where }),
    ]);

    return {
      data: campaigns,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findById(userId: string, userRole: string, id: string) {
    const cacheKey = `campaign:${id}`;
    const cached = await this.redisService.get(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      this.verifyAccess(userId, userRole, parsed.userId);
      return parsed;
    }

    const campaign = await this.prisma.campaign.findUnique({
      where: { id },
      include: {
        advertisements: {
          where: { deletedAt: null },
          select: {
            id: true, name: true, type: true, title: true, status: true,
            impressions: true, clicks: true, conversions: true,
            spend: true, revenue: true, createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: { advertisements: true, conversions: true },
        },
      },
    });

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    this.verifyAccess(userId, userRole, campaign.userId);
    await this.redisService.set(cacheKey, JSON.stringify(campaign), this.CACHE_TTL);
    return campaign;
  }

  async update(userId: string, userRole: string, id: string, dto: any) {
    const campaign = await this.prisma.campaign.findUnique({ where: { id } });
    if (!campaign) throw new NotFoundException('Campaign not found');
    this.verifyAccess(userId, userRole, campaign.userId);

    if (dto.startDate && dto.endDate) {
      const start = new Date(dto.startDate);
      const end = new Date(dto.endDate);
      if (end <= start) {
        throw new BadRequestException('End date must be after start date');
      }
    }

    if (dto.dailyBudget && dto.budget && dto.dailyBudget > dto.budget) {
      throw new BadRequestException('Daily budget cannot exceed total budget');
    }

    if (dto.budget && new Prisma.Decimal(dto.budget).lessThan(campaign.spent)) {
      throw new BadRequestException(
        `New budget (${dto.budget}) is less than already spent (${campaign.spent})`,
      );
    }

    const data: any = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.type !== undefined) data.type = dto.type;
    if (dto.budget !== undefined) data.budget = new Prisma.Decimal(dto.budget);
    if (dto.dailyBudget !== undefined) data.dailyBudget = new Prisma.Decimal(dto.dailyBudget);
    if (dto.startDate !== undefined) data.startDate = new Date(dto.startDate);
    if (dto.endDate !== undefined) data.endDate = dto.endDate ? new Date(dto.endDate) : null;
    if (dto.targeting !== undefined) data.targeting = dto.targeting;
    if (dto.schedule !== undefined) data.schedule = dto.schedule;
    if (dto.utmSource !== undefined) data.utmSource = dto.utmSource;
    if (dto.utmMedium !== undefined) data.utmMedium = dto.utmMedium;
    if (dto.utmCampaign !== undefined) data.utmCampaign = dto.utmCampaign;
    if (dto.isATestEnabled !== undefined) data.isATestEnabled = dto.isATestEnabled;

    const updated = await this.prisma.campaign.update({
      where: { id },
      data,
      include: {
        _count: {
          select: { advertisements: true, conversions: true },
        },
      },
    });

    await this.redisService.del(`campaign:${id}`);
    await this.redisService.del(`campaigns:user:${userId}`);
    this.logger.log(`Campaign updated: ${campaign.name}`);
    return updated;
  }

  async remove(userId: string, userRole: string, id: string) {
    const campaign = await this.prisma.campaign.findUnique({ where: { id } });
    if (!campaign) throw new NotFoundException('Campaign not found');
    this.verifyAccess(userId, userRole, campaign.userId);

    await this.prisma.campaign.update({
      where: { id },
      data: { deletedAt: new Date(), status: CampaignStatus.CANCELLED },
    });

    await this.redisService.del(`campaign:${id}`);
    await this.redisService.del(`campaigns:user:${userId}`);
    return { message: 'Campaign archived successfully' };
  }

  async duplicate(userId: string, userRole: string, id: string) {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id },
      include: { advertisements: { where: { deletedAt: null } } },
    });
    if (!campaign) throw new NotFoundException('Campaign not found');
    this.verifyAccess(userId, userRole, campaign.userId);

    const newCampaign = await this.prisma.campaign.create({
      data: {
        userId,
        name: `${campaign.name} (Copy)`,
        description: campaign.description,
        type: campaign.type,
        budget: campaign.budget,
        dailyBudget: campaign.dailyBudget,
        startDate: campaign.startDate,
        endDate: campaign.endDate,
        targeting: campaign.targeting || Prisma.JsonNull,
        schedule: campaign.schedule || Prisma.JsonNull,
        utmSource: campaign.utmSource,
        utmMedium: campaign.utmMedium,
        utmCampaign: campaign.utmCampaign,
        isATestEnabled: campaign.isATestEnabled,
        status: CampaignStatus.DRAFT,
      },
    });

    if (campaign.advertisements.length > 0) {
      await this.prisma.advertisement.createMany({
        data: campaign.advertisements.map((ad) => ({
          campaignId: newCampaign.id,
          name: `${ad.name} (Copy)`,
          type: ad.type,
          title: ad.title,
          description: ad.description,
          mediaUrl: ad.mediaUrl,
          targetUrl: ad.targetUrl,
          dimensions: ad.dimensions,
          weight: ad.weight,
          content: ad.content,
          html: ad.html,
          css: ad.css,
          js: ad.js,
          callToAction: ad.callToAction,
          altText: ad.altText,
          metadata: ad.metadata || Prisma.JsonNull,
          isATestVariant: ad.isATestVariant,
          aTestGroup: ad.aTestGroup,
          status: 'PENDING',
        })),
      });
    }

    await this.redisService.del(`campaigns:user:${userId}`);
    return this.findById(userId, userRole, newCampaign.id);
  }

  async updateStatus(userId: string, userRole: string, id: string, status: CampaignStatus) {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id },
      include: { advertisements: { where: { deletedAt: null } } },
    });
    if (!campaign) throw new NotFoundException('Campaign not found');
    this.verifyAccess(userId, userRole, campaign.userId);

    const validTransitions: Record<string, string[]> = {
      [CampaignStatus.DRAFT]: [CampaignStatus.PENDING_REVIEW, CampaignStatus.CANCELLED],
      [CampaignStatus.PENDING_REVIEW]: [CampaignStatus.ACTIVE, CampaignStatus.REJECTED, CampaignStatus.DRAFT],
      [CampaignStatus.ACTIVE]: [CampaignStatus.PAUSED, CampaignStatus.COMPLETED],
      [CampaignStatus.PAUSED]: [CampaignStatus.ACTIVE, CampaignStatus.COMPLETED, CampaignStatus.CANCELLED],
      [CampaignStatus.COMPLETED]: [],
      [CampaignStatus.CANCELLED]: [],
      [CampaignStatus.REJECTED]: [CampaignStatus.DRAFT, CampaignStatus.PENDING_REVIEW],
    };

    const allowed = validTransitions[campaign.status];
    if (!allowed || !allowed.includes(status)) {
      throw new BadRequestException(
        `Cannot transition from ${campaign.status} to ${status}`,
      );
    }

    if (status === CampaignStatus.ACTIVE) {
      await this.validateCampaignActivation(campaign);
    }

    const updated = await this.prisma.campaign.update({
      where: { id },
      data: { status },
    });

    await this.redisService.del(`campaign:${id}`);
    this.logger.log(`Campaign ${campaign.name} status changed to ${status}`);
    return updated;
  }

  async updateBudget(userId: string, userRole: string, id: string, dto: any) {
    const campaign = await this.prisma.campaign.findUnique({ where: { id } });
    if (!campaign) throw new NotFoundException('Campaign not found');
    this.verifyAccess(userId, userRole, campaign.userId);

    if (new Prisma.Decimal(dto.budget).lessThan(campaign.spent)) {
      throw new BadRequestException(
        `New budget (${dto.budget}) is less than already spent (${campaign.spent})`,
      );
    }

    if (dto.dailyBudget && new Prisma.Decimal(dto.dailyBudget).greaterThan(dto.budget)) {
      throw new BadRequestException('Daily budget cannot exceed total budget');
    }

    const updated = await this.prisma.campaign.update({
      where: { id },
      data: {
        budget: new Prisma.Decimal(dto.budget),
        ...(dto.dailyBudget != null ? { dailyBudget: new Prisma.Decimal(dto.dailyBudget) } : {}),
      },
    });

    await this.redisService.del(`campaign:${id}`);
    this.logger.log(`Campaign ${campaign.name} budget updated to ${dto.budget}`);
    return updated;
  }

  async getAnalytics(userId: string, userRole: string, id: string, startDate?: string, endDate?: string) {
    const campaign = await this.prisma.campaign.findUnique({ where: { id } });
    if (!campaign) throw new NotFoundException('Campaign not found');
    this.verifyAccess(userId, userRole, campaign.userId);

    const ads = await this.prisma.advertisement.findMany({
      where: { campaignId: id, deletedAt: null },
      select: {
        id: true, name: true, type: true, status: true,
        impressions: true, clicks: true, conversions: true,
        spend: true, revenue: true,
      },
    });

    const impressionWhere: any = { advertisement: { campaignId: id } };
    const clickWhere: any = { advertisement: { campaignId: id } };
    const conversionWhere: any = { campaignId: id };

    if (startDate) {
      const sd = new Date(startDate);
      impressionWhere.createdAt = { gte: sd };
      clickWhere.createdAt = { gte: sd };
      conversionWhere.createdAt = { gte: sd };
    }
    if (endDate) {
      const ed = new Date(endDate);
      impressionWhere.createdAt = { ...impressionWhere.createdAt, lte: ed };
      clickWhere.createdAt = { ...clickWhere.createdAt, lte: ed };
      conversionWhere.createdAt = { ...conversionWhere.createdAt, lte: ed };
    }

    const [impressions, clicks, conversions, dailyStats] = await Promise.all([
      this.prisma.adImpression.findMany({
        where: impressionWhere,
        select: { id: true, country: true, device: true, browser: true, os: true, isUnique: true, isFraud: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: 1000,
      }),
      this.prisma.adClick.findMany({
        where: clickWhere,
        select: { id: true, country: true, device: true, browser: true, os: true, isUnique: true, isFraud: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: 1000,
      }),
      this.prisma.conversion.findMany({
        where: conversionWhere,
        select: { id: true, value: true, type: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: 1000,
      }),
      this.getDailyStats(id, startDate, endDate),
    ]);

    const totalImpressions = impressions.length;
    const totalClicks = clicks.length;
    const totalConversions = conversions.length;
    const totalSpend = ads.reduce((sum, a) => sum + Number(a.spend), 0);
    const totalRevenue = ads.reduce((sum, a) => sum + Number(a.revenue), 0);
    const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
    const cvr = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;
    const cpc = totalClicks > 0 ? totalSpend / totalClicks : 0;
    const cpm = totalImpressions > 0 ? (totalSpend / totalImpressions) * 1000 : 0;
    const roas = totalSpend > 0 ? totalRevenue / totalSpend : 0;

    const uniqueImpressions = impressions.filter((i) => i.isUnique).length;
    const uniqueClicks = clicks.filter((c) => c.isUnique).length;
    const fraudImpressions = impressions.filter((i) => i.isFraud).length;
    const fraudClicks = clicks.filter((c) => c.isFraud).length;

    const countryBreakdown = this.groupBy(impressions, 'country');
    const deviceBreakdown = this.groupBy(impressions, 'device');
    const browserBreakdown = this.groupBy(impressions, 'browser');

    return {
      campaign: {
        id: campaign.id,
        name: campaign.name,
        status: campaign.status,
        type: campaign.type,
        budget: campaign.budget,
        spent: campaign.spent,
        dailyBudget: campaign.dailyBudget,
        startDate: campaign.startDate,
        endDate: campaign.endDate,
      },
      ads,
      metrics: {
        impressions: totalImpressions,
        clicks: totalClicks,
        conversions: totalConversions,
        uniqueImpressions,
        uniqueClicks,
        spend: totalSpend,
        revenue: totalRevenue,
        ctr: Math.round(ctr * 100) / 100,
        cvr: Math.round(cvr * 100) / 100,
        cpc: Math.round(cpc * 100) / 100,
        cpm: Math.round(cpm * 100) / 100,
        roas: Math.round(roas * 100) / 100,
      },
      fraud: {
        impressions: fraudImpressions,
        clicks: fraudClicks,
        fraudRate: totalImpressions > 0 ? Math.round((fraudImpressions / totalImpressions) * 10000) / 100 : 0,
      },
      breakdown: {
        byCountry: countryBreakdown,
        byDevice: deviceBreakdown,
        byBrowser: browserBreakdown,
      },
      dailyStats,
    };
  }

  private async getDailyStats(campaignId: string, startDate?: string, endDate?: string) {
    const impressions = await this.prisma.adImpression.findMany({
      where: {
        advertisement: { campaignId },
        ...(startDate || endDate ? {
          createdAt: {
            ...(startDate ? { gte: new Date(startDate) } : {}),
            ...(endDate ? { lte: new Date(endDate) } : {}),
          },
        } : {}),
      },
      select: { createdAt: true, isFraud: true },
      orderBy: { createdAt: 'asc' },
    });

    const clicks = await this.prisma.adClick.findMany({
      where: {
        advertisement: { campaignId },
        ...(startDate || endDate ? {
          createdAt: {
            ...(startDate ? { gte: new Date(startDate) } : {}),
            ...(endDate ? { lte: new Date(endDate) } : {}),
          },
        } : {}),
      },
      select: { createdAt: true, isFraud: true },
      orderBy: { createdAt: 'asc' },
    });

    const dailyMap = new Map<string, { date: string; impressions: number; clicks: number; fraudImpressions: number; fraudClicks: number }>();

    for (const imp of impressions) {
      const key = imp.createdAt.toISOString().split('T')[0];
      const entry = dailyMap.get(key) || { date: key, impressions: 0, clicks: 0, fraudImpressions: 0, fraudClicks: 0 };
      entry.impressions++;
      if (imp.isFraud) entry.fraudImpressions++;
      dailyMap.set(key, entry);
    }

    for (const clk of clicks) {
      const key = clk.createdAt.toISOString().split('T')[0];
      const entry = dailyMap.get(key) || { date: key, impressions: 0, clicks: 0, fraudImpressions: 0, fraudClicks: 0 };
      entry.clicks++;
      if (clk.isFraud) entry.fraudClicks++;
      dailyMap.set(key, entry);
    }

    return Array.from(dailyMap.values()).sort((a, b) => a.date.localeCompare(b.date));
  }

  private groupBy(items: any[], key: string): Record<string, number> {
    return items.reduce((acc: Record<string, number>, item: any) => {
      const val = item[key] || 'unknown';
      acc[val] = (acc[val] || 0) + 1;
      return acc;
    }, {});
  }

  private async validateCampaignActivation(campaign: any): Promise<void> {
    if (campaign.advertisements.length === 0) {
      throw new BadRequestException('Campaign must have at least one active advertisement');
    }

    const hasActiveAds = campaign.advertisements.some((ad: any) => ad.status === 'ACTIVE');
    if (!hasActiveAds) {
      throw new BadRequestException('Campaign must have at least one active advertisement');
    }

    if (new Prisma.Decimal(campaign.budget).lessThanOrEqualTo(0)) {
      throw new BadRequestException('Campaign budget must be greater than 0');
    }

    if (campaign.endDate && new Date(campaign.endDate) <= new Date()) {
      throw new BadRequestException('Campaign end date must be in the future');
    }

    const wallet = await this.prisma.wallet.findUnique({
      where: { userId: campaign.userId },
    });

    if (!wallet) {
      throw new BadRequestException('No wallet found. Please setup payment method first');
    }

    const minBalance = new Prisma.Decimal(
      Math.min(
        Number(campaign.dailyBudget || campaign.budget),
        Number(campaign.budget) * 0.1,
      ),
    );

    if (new Prisma.Decimal(wallet.balance).lessThan(minBalance)) {
      throw new BadRequestException(
        `Insufficient wallet balance. Required: ${minBalance}, Available: ${wallet.balance}`,
      );
    }
  }
}
