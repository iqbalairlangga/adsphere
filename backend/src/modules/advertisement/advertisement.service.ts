import {
  Injectable, NotFoundException, BadRequestException,
  ForbiddenException, Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../redis/redis.service';
import { AdStatus, AdType, UserRole } from '../../common/constants';
import { Prisma } from '@prisma/client';

interface RequestContext {
  ip: string;
  userAgent?: string;
  referer?: string;
  language?: string;
  sessionId?: string;
}

@Injectable()
export class AdvertisementService {
  private readonly logger = new Logger(AdvertisementService.name);
  private readonly CACHE_TTL = 120;
  private readonly FRAUD_THRESHOLD = 10;

  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
  ) {}

  private async verifyAccess(userId: string, userRole: string, ownerId: string): Promise<void> {
    if (ownerId !== userId && userRole !== UserRole.SUPER_ADMIN && userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('Access denied');
    }
  }

  async create(userId: string, dto: any) {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id: dto.campaignId },
    });
    if (!campaign) throw new NotFoundException('Campaign not found');
    if (campaign.userId !== userId) throw new ForbiddenException('Access denied');

    if (campaign.status === 'COMPLETED' || campaign.status === 'CANCELLED') {
      throw new BadRequestException('Cannot add ads to completed/cancelled campaigns');
    }

    const ad = await this.prisma.advertisement.create({
      data: {
        campaignId: dto.campaignId,
        name: dto.name,
        type: dto.type || AdType.BANNER,
        title: dto.title,
        description: dto.description,
        mediaUrl: dto.mediaUrl,
        mediaUrls: dto.mediaUrls || [],
        targetUrl: dto.targetUrl || '',
        dimensions: dto.dimensions,
        width: dto.width,
        height: dto.height,
        weight: dto.weight != null ? new Prisma.Decimal(dto.weight) : null,
        content: dto.content,
        html: dto.html,
        css: dto.css,
        js: dto.js,
        callToAction: dto.callToAction,
        altText: dto.altText,
        metadata: dto.metadata || Prisma.JsonNull,
        isABTestVariant: dto.isABTestVariant ?? false,
        aTestGroup: dto.aTestGroup,
        status: AdStatus.PENDING,
      },
    });

    await this.redisService.del(`campaign:${dto.campaignId}`);
    await this.redisService.del(`campaigns:user:${userId}`);
    this.logger.log(`Ad created: ${ad.name} in campaign ${campaign.name}`);
    return ad;
  }

  async findAll(userId: string, userRole: string, query: any) {
    const {
      campaignId, search, status, type, page = 1, limit = 10,
      sortBy = 'createdAt', sortOrder = 'DESC' as 'ASC' | 'DESC',
    } = query;

    const where: Prisma.AdvertisementWhereInput = { deletedAt: null };

    if (userRole !== UserRole.SUPER_ADMIN && userRole !== UserRole.ADMIN) {
      where.campaign = { userId };
    }

    if (campaignId) where.campaignId = campaignId;
    if (status) where.status = status as AdStatus;
    if (type) where.type = type as AdType;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const skip = (page - 1) * limit;

    const [ads, total] = await Promise.all([
      this.prisma.advertisement.findMany({
        where,
        include: {
          campaign: {
            select: { id: true, name: true, status: true, userId: true },
          },
        },
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      this.prisma.advertisement.count({ where }),
    ]);

    return {
      data: ads,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findById(userId: string, userRole: string, id: string) {
    const cacheKey = `ad:${id}`;
    const cached = await this.redisService.get(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      const campaign = await this.prisma.campaign.findUnique({ where: { id: parsed.campaignId } });
      if (campaign) this.verifyAccess(userId, userRole, campaign.userId);
      return parsed;
    }

    const ad = await this.prisma.advertisement.findUnique({
      where: { id },
      include: {
        campaign: { select: { id: true, name: true, status: true, userId: true } },
        adImpressions: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          select: { id: true, ip: true, country: true, device: true, browser: true, isFraud: true, createdAt: true },
        },
        adClicks: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          select: { id: true, ip: true, country: true, device: true, browser: true, isFraud: true, createdAt: true },
        },
        _count: {
          select: { adImpressions: true, adClicks: true, adConversions: true },
        },
      },
    });

    if (!ad) throw new NotFoundException('Advertisement not found');
    this.verifyAccess(userId, userRole, ad.campaign.userId);

    await this.redisService.set(cacheKey, JSON.stringify(ad), this.CACHE_TTL);
    return ad;
  }

  async update(userId: string, userRole: string, id: string, dto: any) {
    const ad = await this.prisma.advertisement.findUnique({
      where: { id },
      include: { campaign: true },
    });
    if (!ad) throw new NotFoundException('Advertisement not found');
    this.verifyAccess(userId, userRole, ad.campaign.userId);

    const data: any = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.title !== undefined) data.title = dto.title;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.mediaUrl !== undefined) data.mediaUrl = dto.mediaUrl;
    if (dto.mediaUrls !== undefined) data.mediaUrls = dto.mediaUrls;
    if (dto.targetUrl !== undefined) data.targetUrl = dto.targetUrl;
    if (dto.dimensions !== undefined) data.dimensions = dto.dimensions;
    if (dto.width !== undefined) data.width = dto.width;
    if (dto.height !== undefined) data.height = dto.height;
    if (dto.weight !== undefined) data.weight = new Prisma.Decimal(dto.weight);
    if (dto.content !== undefined) data.content = dto.content;
    if (dto.html !== undefined) data.html = dto.html;
    if (dto.css !== undefined) data.css = dto.css;
    if (dto.js !== undefined) data.js = dto.js;
    if (dto.callToAction !== undefined) data.callToAction = dto.callToAction;
    if (dto.altText !== undefined) data.altText = dto.altText;
    if (dto.metadata !== undefined) data.metadata = dto.metadata;
    if (dto.isABTestVariant !== undefined) data.isABTestVariant = dto.isABTestVariant;
    if (dto.aTestGroup !== undefined) data.aTestGroup = dto.aTestGroup;
    if (dto.status !== undefined) {
      if (dto.status === AdStatus.ACTIVE && ad.campaign.status !== 'ACTIVE') {
        throw new BadRequestException('Campaign must be active to activate ads');
      }
      data.status = dto.status;
    }

    const updated = await this.prisma.advertisement.update({
      where: { id },
      data,
    });

    await this.redisService.del(`ad:${id}`);
    await this.redisService.del(`campaign:${ad.campaignId}`);
    return updated;
  }

  async remove(userId: string, userRole: string, id: string) {
    const ad = await this.prisma.advertisement.findUnique({
      where: { id },
      include: { campaign: true },
    });
    if (!ad) throw new NotFoundException('Advertisement not found');
    this.verifyAccess(userId, userRole, ad.campaign.userId);

    await this.prisma.advertisement.update({
      where: { id },
      data: { deletedAt: new Date(), status: AdStatus.PAUSED },
    });

    await this.redisService.del(`ad:${id}`);
    await this.redisService.del(`campaign:${ad.campaignId}`);
    return { message: 'Advertisement archived' };
  }

  async updateStatus(userId: string, userRole: string, id: string, status: AdStatus) {
    const ad = await this.prisma.advertisement.findUnique({
      where: { id },
      include: { campaign: true },
    });
    if (!ad) throw new NotFoundException('Advertisement not found');
    this.verifyAccess(userId, userRole, ad.campaign.userId);

    if (status === AdStatus.ACTIVE && ad.campaign.status !== 'ACTIVE') {
      throw new BadRequestException('Campaign must be active to activate ads');
    }

    if (status === ad.status) {
      return ad;
    }

    const updated = await this.prisma.advertisement.update({
      where: { id },
      data: { status },
    });

    await this.redisService.del(`ad:${id}`);
    await this.redisService.del(`campaign:${ad.campaignId}`);
    this.logger.log(`Ad ${ad.name} status changed to ${status}`);
    return updated;
  }

  async bulkUpdateStatus(userId: string, ids: string[], status: AdStatus) {
    const ads = await this.prisma.advertisement.findMany({
      where: { id: { in: ids } },
      include: { campaign: true },
    });

    if (ads.length !== ids.length) {
      throw new NotFoundException('One or more advertisements not found');
    }

    const hasAccess = ads.every((ad) => ad.campaign.userId === userId);
    if (!hasAccess) {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (!user || (user.role !== UserRole.SUPER_ADMIN && user.role !== UserRole.ADMIN)) {
        throw new ForbiddenException('Access denied to one or more ads');
      }
    }

    if (status === AdStatus.ACTIVE) {
      const inactiveCampaigns = ads.filter((ad) => ad.campaign.status !== 'ACTIVE');
      if (inactiveCampaigns.length > 0) {
        throw new BadRequestException(
          `Cannot activate ads. Campaign(s) not active: ${[...new Set(inactiveCampaigns.map((a) => a.campaign.name))].join(', ')}`,
        );
      }
    }

    await this.prisma.advertisement.updateMany({
      where: { id: { in: ids } },
      data: { status },
    });

    await Promise.all(ads.map((ad) => this.redisService.del(`ad:${ad.id}`)));

    return { message: `${ids.length} advertisements updated to ${status}` };
  }

  async serveAd(unitId: string, context: RequestContext) {
    const adUnit = await this.prisma.adUnit.findUnique({
      where: { id: unitId },
      include: { website: true },
    });

    if (!adUnit || adUnit.status !== 'active') {
      throw new NotFoundException('Ad unit not found or inactive');
    }

    const placements = await this.prisma.adPlacement.findMany({
      where: {
        adUnitId: unitId,
        status: 'active',
        advertisement: {
          status: AdStatus.ACTIVE,
          campaign: {
            status: 'ACTIVE',
            deletedAt: null,
          },
          deletedAt: null,
        },
      },
      include: {
        advertisement: {
          include: {
            campaign: {
              select: {
                id: true, name: true, type: true, targeting: true,
                schedule: true, isABTestEnabled: true, budget: true,
                spent: true, dailyBudget: true, startDate: true,
                endDate: true,
              },
            },
          },
        },
      },
      orderBy: { priority: 'desc' },
    });

    if (placements.length === 0) {
      if (adUnit.fallbackUrl) {
        return { type: 'redirect', url: adUnit.fallbackUrl };
      }
      throw new NotFoundException('No active ads available for this unit');
    }

    const now = new Date();

    const eligible = placements.filter((p) => {
      const ad = p.advertisement;
      const campaign = ad.campaign;

      if (campaign.spent && campaign.budget &&
          new Prisma.Decimal(campaign.spent).greaterThanOrEqualTo(campaign.budget)) {
        return false;
      }

      if (campaign.endDate && new Date(campaign.endDate) <= now) {
        return false;
      }

      if (new Date(campaign.startDate) > now) {
        return false;
      }

      if (campaign.schedule && !this.isWithinSchedule(campaign.schedule as any, now)) {
        return false;
      }

      if (campaign.targeting && !this.matchesTargeting(campaign.targeting as any, context, adUnit)) {
        return false;
      }

      return true;
    });

    if (eligible.length === 0) {
      if (adUnit.fallbackUrl) {
        return { type: 'redirect', url: adUnit.fallbackUrl };
      }
      throw new NotFoundException('No eligible ads available');
    }

    const selected = this.selectAdWithABTest(eligible);

    const ad = selected.advertisement;
    const campaign = ad.campaign;

    const baseUrl = process.env.APP_URL || 'http://localhost:3000';
    const trackingPixelUrl = `${baseUrl}/ads/serve/${ad.id}/pixel.gif?session=${context.sessionId || ''}`;
    const clickUrl = `${baseUrl}/ads/serve/${ad.id}/click?session=${context.sessionId || ''}`;

    const content = ad.html || this.buildAdContent(ad, clickUrl, trackingPixelUrl);

    this.recordImpressionAsync(ad.id, adUnit.id, context);

    return {
      type: 'ad',
      ad: {
        id: ad.id,
        name: ad.name,
        type: ad.type,
        title: ad.title,
        description: ad.description,
        content,
        html: ad.html,
        mediaUrl: ad.mediaUrl,
        targetUrl: ad.targetUrl,
        dimensions: ad.dimensions,
        width: ad.width,
        height: ad.height,
        callToAction: ad.callToAction,
        altText: ad.altText,
      },
      tracking: {
        pixelUrl: trackingPixelUrl,
        clickUrl: clickUrl,
        impressionUrl: `${baseUrl}/ads/${ad.id}/impression`,
      },
      unit: {
        id: adUnit.id,
        width: adUnit.width,
        height: adUnit.height,
        placement: adUnit.placement,
      },
    };
  }

  private selectAdWithABTest(placements: any[]): any {
    const testGroups = placements.filter((p) => p.advertisement.aTestGroup);

    if (testGroups.length > 0) {
      const groups = new Map<string, any[]>();
      for (const p of testGroups) {
        const group = p.advertisement.aTestGroup;
        if (!groups.has(group)) groups.set(group, []);
        groups.get(group)!.push(p);
      }

      const abCampaigns = placements.filter((p) => p.advertisement.campaign.isABTestEnabled);
      if (abCampaigns.length > 0) {
        const groupKeys = Array.from(groups.keys());
        const selectedGroup = groupKeys[Math.floor(Math.random() * groupKeys.length)];
        const groupAds = groups.get(selectedGroup)!;
        return groupAds[Math.floor(Math.random() * groupAds.length)];
      }
    }

    return placements[Math.floor(Math.random() * Math.min(placements.length, 3))];
  }

  private isWithinSchedule(schedule: any, now: Date): boolean {
    if (!schedule) return true;

    const dayOfWeek = now.getUTCDay();
    if (schedule.dayOfWeek && Array.isArray(schedule.dayOfWeek)) {
      if (!schedule.dayOfWeek.includes(dayOfWeek)) {
        return false;
      }
    }

    if (schedule.startTime && schedule.endTime) {
      const currentMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();
      const [startH, startM] = schedule.startTime.split(':').map(Number);
      const [endH, endM] = schedule.endTime.split(':').map(Number);
      const startMinutes = startH * 60 + startM;
      const endMinutes = endH * 60 + endM;

      if (startMinutes <= endMinutes) {
        if (currentMinutes < startMinutes || currentMinutes > endMinutes) return false;
      } else {
        if (currentMinutes < startMinutes && currentMinutes > endMinutes) return false;
      }
    }

    return true;
  }

  private matchesTargeting(targeting: any, context: RequestContext, adUnit: any): boolean {
    if (!targeting) return true;

    if (targeting.countries && Array.isArray(targeting.countries) && targeting.countries.length > 0) {
      const country = this.geoLookup(context.ip);
      if (!targeting.countries.includes(country)) {
        return false;
      }
    }

    if (targeting.excludeCountries && Array.isArray(targeting.excludeCountries)) {
      const country = this.geoLookup(context.ip);
      if (targeting.excludeCountries.includes(country)) {
        return false;
      }
    }

    if (targeting.devices && Array.isArray(targeting.devices) && targeting.devices.length > 0) {
      const device = this.detectDevice(context.userAgent || '');
      if (!targeting.devices.some((d: string) => d.toLowerCase() === device.toLowerCase())) {
        return false;
      }
    }

    if (targeting.browsers && Array.isArray(targeting.browsers) && targeting.browsers.length > 0) {
      const browser = this.detectBrowser(context.userAgent || '');
      if (!targeting.browsers.some((b: string) => b.toLowerCase() === browser.toLowerCase())) {
        return false;
      }
    }

    if (targeting.os && Array.isArray(targeting.os) && targeting.os.length > 0) {
      const os = this.detectOS(context.userAgent || '');
      if (!targeting.os.some((o: string) => o.toLowerCase() === os.toLowerCase())) {
        return false;
      }
    }

    if (targeting.languages && Array.isArray(targeting.languages) && targeting.languages.length > 0) {
      const lang = (context.language || 'en').split(',')[0].split('-')[0];
      if (!targeting.languages.includes(lang)) {
        return false;
      }
    }

    if (targeting.adSizes && Array.isArray(targeting.adSizes) && targeting.adSizes.length > 0) {
      const adSize = adUnit.width && adUnit.height ? `${adUnit.width}x${adUnit.height}` : null;
      if (adSize && !targeting.adSizes.includes(adSize)) {
        return false;
      }
    }

    if (targeting.domainCategories && Array.isArray(targeting.domainCategories) && targeting.domainCategories.length > 0) {
      if (adUnit.website && adUnit.website.category) {
        if (!targeting.domainCategories.includes(adUnit.website.category)) {
          return false;
        }
      }
    }

    return true;
  }

  private async recordImpressionAsync(adId: string, adUnitId: string, context: RequestContext): Promise<void> {
    Promise.resolve().then(async () => {
      try {
        const isFraud = await this.checkFraud('impression', adId, context);
        const country = this.geoLookup(context.ip);
        const device = this.detectDevice(context.userAgent || '');
        const browser = this.detectBrowser(context.userAgent || '');
        const os = this.detectOS(context.userAgent || '');

        const countKey = `impressions:${adId}:${context.ip}`;
        const impressionCount = await this.redisService.increment(countKey);
        await this.redisService.expire(countKey, 86400);

        const cost = new Prisma.Decimal(0.001);

        await this.prisma.adImpression.create({
          data: {
            advertisementId: adId,
            adUnitId,
            ip: context.ip,
            userAgent: context.userAgent,
            referer: context.referer,
            country,
            device,
            browser,
            os,
            language: context.language,
            sessionId: context.sessionId,
            isUnique: impressionCount <= 1,
            isFraud,
            cost,
          },
        });

        await this.prisma.advertisement.update({
          where: { id: adId },
          data: {
            impressions: { increment: 1 },
            spend: { increment: cost },
          },
        });

        const adRecord = await this.prisma.advertisement.findUnique({
          where: { id: adId },
          select: { campaignId: true },
        });
        if (adRecord) {
          await this.prisma.campaign.update({
            where: { id: adRecord.campaignId },
            data: { spent: { increment: cost } },
          });
        }

        await this.redisService.del(`ad:${adId}`);
      } catch (err) {
        this.logger.error(`Failed to record impression for ad ${adId}: ${(err as Error).message}`);
      }
    });
  }

  async trackImpression(adId: string, data: RequestContext & {
    country?: string; city?: string; device?: string;
    browser?: string; os?: string; language?: string; sessionId?: string;
  }) {
    const ad = await this.prisma.advertisement.findUnique({
      where: { id: adId },
      select: { id: true, campaignId: true },
    });
    if (!ad) throw new NotFoundException('Advertisement not found');

    const country = data.country || this.geoLookup(data.ip || '');
    const device = data.device || this.detectDevice(data.userAgent || '');
    const browser = data.browser || this.detectBrowser(data.userAgent || '');
    const os = data.os || this.detectOS(data.userAgent || '');

    const countKey = `impressions:${adId}:${data.ip}`;
    const impressionCount = await this.redisService.increment(countKey);
    await this.redisService.expire(countKey, 86400);

    const isFraud = await this.checkFraud('impression', adId, data);
    const cost = new Prisma.Decimal(0.001);

    const impression = await this.prisma.adImpression.create({
      data: {
        advertisementId: adId,
        adUnitId: null,
        ip: data.ip,
        userAgent: data.userAgent,
        referer: data.referer,
        country,
        city: data.city,
        device,
        browser,
        os,
        language: data.language,
        sessionId: data.sessionId,
        isUnique: impressionCount <= 1,
        isFraud,
        cost,
      },
    });

    await this.prisma.advertisement.update({
      where: { id: adId },
      data: {
        impressions: { increment: 1 },
        spend: { increment: cost },
      },
    });

    await this.prisma.campaign.update({
      where: { id: ad.campaignId },
      data: { spent: { increment: cost } },
    });

    await this.redisService.del(`ad:${adId}`);
    return impression;
  }

  async trackClick(adId: string, data: RequestContext & {
    country?: string; city?: string; device?: string;
    browser?: string; os?: string; sessionId?: string;
  }) {
    const ad = await this.prisma.advertisement.findUnique({
      where: { id: adId },
      select: {
        id: true, campaignId: true, targetUrl: true, name: true,
        weight: true,
      },
    });
    if (!ad) throw new NotFoundException('Advertisement not found');

    const country = data.country || this.geoLookup(data.ip || '');
    const device = data.device || this.detectDevice(data.userAgent || '');
    const browser = data.browser || this.detectBrowser(data.userAgent || '');
    const os = data.os || this.detectOS(data.userAgent || '');

    const isFraud = await this.checkFraud('click', adId, data);
    const cost = ad.weight || new Prisma.Decimal(0.005);

    const click = await this.prisma.adClick.create({
      data: {
        advertisementId: adId,
        adUnitId: null,
        ip: data.ip,
        userAgent: data.userAgent,
        referer: data.referer,
        country,
        city: data.city,
        device,
        browser,
        os,
        sessionId: data.sessionId,
        isUnique: true,
        isFraud,
        cost,
      },
    });

    await this.prisma.advertisement.update({
      where: { id: adId },
      data: {
        clicks: { increment: 1 },
        spend: { increment: cost },
      },
    });

    await this.prisma.campaign.update({
      where: { id: ad.campaignId },
      data: { spent: { increment: cost } },
    });

    await this.redisService.del(`ad:${adId}`);
    this.logger.log(`Click tracked for ad ${ad.name}`);

    return { click: { id: click.id }, targetUrl: ad.targetUrl };
  }

  async trackConversion(adId: string, data: {
    type?: string; value?: number; currency?: string;
    orderId?: string; customerId?: string; eventName?: string; eventData?: Record<string, unknown>;
  }) {
    const ad = await this.prisma.advertisement.findUnique({
      where: { id: adId },
      select: { id: true, campaignId: true, name: true },
    });
    if (!ad) throw new NotFoundException('Advertisement not found');

    const conversionValue = data.value ?? 0;
    const revenue = new Prisma.Decimal(conversionValue);
    const currency = data.currency || 'USD';

    const conversion = await this.prisma.conversion.create({
      data: {
        campaignId: ad.campaignId,
        advertisementId: adId,
        type: data.type,
        value: revenue,
        currency,
        orderId: data.orderId,
        customerId: data.customerId,
        eventName: data.eventName,
        eventData: (data.eventData || Prisma.JsonNull) as any,
      },
    });

    await this.prisma.adConversion.create({
      data: {
        advertisementId: adId,
        conversionId: conversion.id,
        value: revenue,
        currency,
        cost: new Prisma.Decimal(0),
        revenue,
      },
    });

    await this.prisma.advertisement.update({
      where: { id: adId },
      data: {
        conversions: { increment: 1 },
        revenue: { increment: revenue },
      },
    });

    await this.redisService.del(`ad:${adId}`);
    this.logger.log(`Conversion tracked for ad ${ad.name}`);

    return conversion;
  }

  private async checkFraud(type: 'impression' | 'click', adId: string, context: RequestContext): Promise<boolean> {
    try {
      const fraudChecks = [
        this.checkVelocityFraud(type, adId, context),
        this.checkDuplicateFraud(type, adId, context),
        this.checkBotFraud(context.userAgent || ''),
      ];

      const results = await Promise.all(fraudChecks);
      const isFraud = results.some((r) => r);

      if (isFraud) {
        this.logger.warn(`Potential fraud detected: ${type} on ad ${adId} from IP ${context.ip}`);

        await this.prisma.fraudDetection.create({
          data: {
            advertisementId: adId,
            type,
            score: results.filter(Boolean).length / results.length,
            severity: 'MEDIUM',
            status: 'INVESTIGATING',
            details: { ip: context.ip, userAgent: context.userAgent, checks: results },
            ip: context.ip,
            userAgent: context.userAgent,
          },
        });
      }

      return isFraud;
    } catch (err) {
      this.logger.error(`Fraud check error: ${(err as Error).message}`);
      return false;
    }
  }

  private async checkVelocityFraud(type: string, adId: string, context: RequestContext): Promise<boolean> {
    const key = `fraud:${type}:${adId}:${context.ip}`;
    const count = await this.redisService.increment(key);
    await this.redisService.expire(key, 60);
    return count > this.FRAUD_THRESHOLD;
  }

  private async checkDuplicateFraud(type: string, adId: string, context: RequestContext): Promise<boolean> {
    const key = `dedup:${type}:${adId}:${context.ip}:${context.userAgent}`;
    const exists = await this.redisService.exists(key);
    if (!exists) {
      await this.redisService.set(key, '1', 86400);
    }
    return false;
  }

  private checkBotFraud(userAgent: string): boolean {
    if (!userAgent) return true;

    const botPatterns = [
      'bot', 'crawl', 'spider', 'scrap', 'fetch', 'curl', 'wget',
      'python-requests', 'go-http-client', 'java/', 'libwww',
      'httpclient', 'nutch', 'phpcrawl', 'msnbot', 'slurp',
      'yandex', 'baiduspider', 'sogou', 'exabot', 'facebot',
      'ia_archiver', 'adsbot', 'googlebot', 'bingbot', 'duckduckbot',
      'ahrefsbot', 'semrushbot', 'majestic', 'rogerbot',
    ];

    const ua = userAgent.toLowerCase();
    return botPatterns.some((pattern) => ua.includes(pattern));
  }

  private buildAdContent(ad: any, clickUrl: string, trackingPixelUrl: string): string {
    const dimensions = ad.dimensions || `${ad.width || 300}x${ad.height || 250}`;
    const [w, h] = dimensions.split('x').map(Number);

    if (ad.type === AdType.VIDEO) {
      return `<div style="position:relative;width:${w}px;height:${h}px;overflow:hidden;">
        <video width="${w}" height="${h}" autoplay muted loop
          style="width:100%;height:100%;object-fit:cover;"
          onclick="window.open('${clickUrl}','_blank')">
          ${ad.mediaUrl ? `<source src="${ad.mediaUrl}" type="video/mp4">` : ''}
        </video>
        <img src="${trackingPixelUrl}" width="1" height="1" alt=""/>
      </div>`;
    }

    if (ad.type === AdType.NATIVE) {
      return `<div style="display:inline-block;max-width:${w}px;font-family:Arial,sans-serif;border:1px solid #eee;border-radius:8px;overflow:hidden;cursor:pointer;"
        onclick="window.open('${clickUrl}','_blank')">
        ${ad.mediaUrl ? `<img src="${ad.mediaUrl}" style="width:100%;height:auto;display:block;" alt="${ad.altText || ''}">` : ''}
        <div style="padding:12px;">
          ${ad.title ? `<h4 style="margin:0 0 6px;font-size:16px;color:#333;">${ad.title}</h4>` : ''}
          ${ad.description ? `<p style="margin:0;font-size:13px;color:#666;line-height:1.4;">${ad.description}</p>` : ''}
          ${ad.callToAction ? `<span style="display:inline-block;margin-top:8px;padding:6px 16px;background:#007bff;color:#fff;border-radius:4px;font-size:13px;">${ad.callToAction}</span>` : ''}
        </div>
        <img src="${trackingPixelUrl}" width="1" height="1" alt=""/>
      </div>`;
    }

    return `<a href="${clickUrl}" target="_blank" rel="noopener noreferrer"
      style="display:inline-block;width:${w}px;height:${h}px;text-decoration:none;border:0;">
      ${ad.mediaUrl
        ? `<img src="${ad.mediaUrl}" width="${w}" height="${h}"
             style="border:0;display:block;width:100%;height:100%;object-fit:contain;"
             alt="${ad.altText || ad.title || 'Advertisement'}">`
        : `<div style="width:${w}px;height:${h}px;background:#f0f0f0;display:flex;align-items:center;justify-content:center;color:#999;font-family:Arial,sans-serif;font-size:14px;">
             ${ad.title || 'Advertisement'}
           </div>`
      }
      <img src="${trackingPixelUrl}" width="1" height="1" alt=""
        style="position:absolute;width:1px;height:1px;visibility:hidden;"/>
    </a>`;
  }

  private geoLookup(ip: string): string {
    if (!ip || ip === '0.0.0.0' || ip === '127.0.0.1' || ip === '::1') {
      return 'local';
    }
    return 'unknown';
  }

  private detectDevice(ua: string): string {
    if (!ua) return 'unknown';
    const u = ua.toLowerCase();
    if (/(mobile|android.*mobile|iphone|ipod|blackberry|windows phone)/.test(u)) return 'mobile';
    if (/(tablet|ipad|android(?!.*mobile)|playbook|silk)/.test(u)) return 'tablet';
    if (/(smarttv|tv|googletv|hbbtv|appletv)/.test(u)) return 'tv';
    if (/(watch|smartwatch|android wear)/.test(u)) return 'wearable';
    return 'desktop';
  }

  private detectBrowser(ua: string): string {
    if (!ua) return 'unknown';
    const u = ua.toLowerCase();
    if (u.includes('opr') || u.includes('opera')) return 'opera';
    if (u.includes('edg') || u.includes('edge')) return 'edge';
    if (u.includes('chrome') && !u.includes('chromium')) return 'chrome';
    if (u.includes('chromium')) return 'chromium';
    if (u.includes('firefox') && !u.includes('seamonkey')) return 'firefox';
    if (u.includes('safari') && !u.includes('chrome')) return 'safari';
    if (u.includes('msie') || u.includes('trident')) return 'ie';
    if (u.includes('seamonkey')) return 'seamonkey';
    return 'unknown';
  }

  private detectOS(ua: string): string {
    if (!ua) return 'unknown';
    const u = ua.toLowerCase();
    if (u.includes('windows')) return 'windows';
    if (u.includes('mac os') || u.includes('macintosh')) return 'macos';
    if (u.includes('android')) return 'android';
    if (u.includes('ios') || u.includes('iphone os') || (u.includes('ipad') && !u.includes('mac os'))) return 'ios';
    if (u.includes('linux') && !u.includes('android')) return 'linux';
    if (u.includes('chrome os') || u.includes('cros')) return 'chromeos';
    if (u.includes('ubuntu')) return 'ubuntu';
    return 'unknown';
  }
}
