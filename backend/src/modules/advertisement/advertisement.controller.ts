import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query,
  UseGuards, HttpStatus, HttpCode, Res, Headers, Req,
} from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiParam,
  ApiBody, ApiResponse, ApiExtraModels, ApiHeader,
} from '@nestjs/swagger';
import {
  IsString, IsOptional, IsEnum, IsNumber, Min, IsObject,
  IsUUID, IsUrl, IsBoolean, IsArray, MinLength, MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Response, Request } from 'express';
import { AdvertisementService } from './advertisement.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { AdType, AdStatus, UserRole } from '../../common/constants';

class CreateAdDto {
  @IsUUID('4')
  campaignId!: string;

  @IsEnum(AdType)
  type!: AdType;

  @IsString()
  @MinLength(3)
  @MaxLength(200)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;

  @IsOptional()
  @IsUrl({})
  mediaUrl?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  mediaUrls?: string[];

  @IsOptional()
  @IsUrl({})
  targetUrl?: string;

  @IsOptional()
  @IsString()
  dimensions?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  width?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  height?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  weight?: number;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsString()
  html?: string;

  @IsOptional()
  @IsString()
  css?: string;

  @IsOptional()
  @IsString()
  js?: string;

  @IsOptional()
  @IsString()
  callToAction?: string;

  @IsOptional()
  @IsString()
  altText?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;

  @IsOptional()
  @IsBoolean()
  isATestVariant?: boolean;

  @IsOptional()
  @IsString()
  aTestGroup?: string;
}

class UpdateAdDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;

  @IsOptional()
  @IsUrl({})
  mediaUrl?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  mediaUrls?: string[];

  @IsOptional()
  @IsUrl({})
  targetUrl?: string;

  @IsOptional()
  @IsString()
  dimensions?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  width?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  height?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  weight?: number;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsString()
  html?: string;

  @IsOptional()
  @IsString()
  css?: string;

  @IsOptional()
  @IsString()
  js?: string;

  @IsOptional()
  @IsString()
  callToAction?: string;

  @IsOptional()
  @IsString()
  altText?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;

  @IsOptional()
  @IsBoolean()
  isATestVariant?: boolean;

  @IsOptional()
  @IsString()
  aTestGroup?: string;

  @IsOptional()
  @IsEnum(AdStatus)
  status?: AdStatus;
}

class BulkStatusDto {
  @IsArray()
  @IsUUID('4', { each: true })
  ids!: string[];

  @IsEnum(AdStatus)
  status!: AdStatus;
}

class TrackImpressionDto {
  @IsOptional()
  @IsString()
  ip?: string;

  @IsOptional()
  @IsString()
  userAgent?: string;

  @IsOptional()
  @IsString()
  referer?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  device?: string;

  @IsOptional()
  @IsString()
  browser?: string;

  @IsOptional()
  @IsString()
  os?: string;

  @IsOptional()
  @IsString()
  language?: string;

  @IsOptional()
  @IsString()
  sessionId?: string;
}

class TrackClickDto {
  @IsOptional()
  @IsString()
  ip?: string;

  @IsOptional()
  @IsString()
  userAgent?: string;

  @IsOptional()
  @IsString()
  referer?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  device?: string;

  @IsOptional()
  @IsString()
  browser?: string;

  @IsOptional()
  @IsString()
  os?: string;

  @IsOptional()
  @IsString()
  sessionId?: string;
}

class TrackConversionDto {
  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsNumber()
  value?: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  orderId?: string;

  @IsOptional()
  @IsString()
  customerId?: string;

  @IsOptional()
  @IsString()
  eventName?: string;

  @IsOptional()
  @IsObject()
  eventData?: Record<string, unknown>;
}

class QueryAdDto {
  @IsOptional()
  @IsUUID('4')
  campaignId?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(AdStatus)
  status?: AdStatus;

  @IsOptional()
  @IsEnum(AdType)
  type?: AdType;

  @IsOptional()
  @Type(() => Number)
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @Min(1)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}

@ApiTags('Advertisements')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('ads')
@ApiExtraModels(CreateAdDto, UpdateAdDto, BulkStatusDto, TrackImpressionDto, TrackClickDto, TrackConversionDto, QueryAdDto)
export class AdvertisementController {
  constructor(private readonly advertisementService: AdvertisementService) {}

  @Post()
  @Roles(UserRole.ADVERTISER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create a new advertisement' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Ad created successfully' })
  async create(
    @CurrentUser() user: { id: string; role: string },
    @Body() dto: CreateAdDto,
  ) {
    return this.advertisementService.create(user.id, dto);
  }

  @Get()
  @Roles(UserRole.ADVERTISER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'List advertisements with filtering and pagination' })
  @ApiQuery({ name: 'campaignId', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'status', enum: AdStatus, required: false })
  @ApiQuery({ name: 'type', enum: AdType, required: false })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  async findAll(
    @CurrentUser() user: { id: string; role: string },
    @Query() query: QueryAdDto,
  ) {
    return this.advertisementService.findAll(user.id, user.role, query);
  }

  @Get(':id')
  @Roles(UserRole.ADVERTISER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get advertisement by ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: HttpStatus.OK, description: 'Ad found' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Ad not found' })
  async findById(
    @CurrentUser() user: { id: string; role: string },
    @Param('id') id: string,
  ) {
    return this.advertisementService.findById(user.id, user.role, id);
  }

  @Patch(':id')
  @Roles(UserRole.ADVERTISER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update advertisement' })
  @ApiParam({ name: 'id', type: String })
  async update(
    @CurrentUser() user: { id: string; role: string },
    @Param('id') id: string,
    @Body() dto: UpdateAdDto,
  ) {
    return this.advertisementService.update(user.id, user.role, id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADVERTISER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Archive advertisement (soft delete)' })
  @ApiParam({ name: 'id', type: String })
  async remove(
    @CurrentUser() user: { id: string; role: string },
    @Param('id') id: string,
  ) {
    return this.advertisementService.remove(user.id, user.role, id);
  }

  @Post(':id/activate')
  @Roles(UserRole.ADVERTISER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Activate an advertisement' })
  @ApiParam({ name: 'id', type: String })
  async activate(
    @CurrentUser() user: { id: string; role: string },
    @Param('id') id: string,
  ) {
    return this.advertisementService.updateStatus(user.id, user.role, id, AdStatus.ACTIVE);
  }

  @Post(':id/pause')
  @Roles(UserRole.ADVERTISER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Pause an advertisement' })
  @ApiParam({ name: 'id', type: String })
  async pause(
    @CurrentUser() user: { id: string; role: string },
    @Param('id') id: string,
  ) {
    return this.advertisementService.updateStatus(user.id, user.role, id, AdStatus.PAUSED);
  }

  @Post('bulk-status')
  @Roles(UserRole.ADVERTISER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Bulk update advertisement statuses' })
  async bulkUpdateStatus(
    @CurrentUser() user: { id: string; role: string },
    @Body() dto: BulkStatusDto,
  ) {
    return this.advertisementService.bulkUpdateStatus(user.id, dto.ids, dto.status);
  }

  @Public()
  @Get('serve/:unitId')
  @ApiOperation({ summary: 'Serve an ad for a given ad unit (public)' })
  @ApiParam({ name: 'unitId', type: String, description: 'Ad Unit ID' })
  @ApiHeader({ name: 'x-forwarded-for', required: false })
  @ApiHeader({ name: 'user-agent', required: false })
  @ApiHeader({ name: 'referer', required: false })
  @ApiResponse({ status: HttpStatus.OK, description: 'Ad content with tracking pixel' })
  async serveAd(
    @Param('unitId') unitId: string,
    @Req() req: Request,
    @Headers('x-forwarded-for') forwardedFor?: string,
    @Headers('user-agent') userAgent?: string,
    @Headers('referer') referer?: string,
  ) {
    const ip = forwardedFor?.split(',')[0]?.trim() || req.ip || '0.0.0.0';
    const result = await this.advertisementService.serveAd(unitId, {
      ip,
      userAgent: userAgent || 'unknown',
      referer: referer || '',
      language: req.headers['accept-language'],
    });
    return result;
  }

  @Public()
  @Get('serve/:adId/click')
  @ApiOperation({ summary: 'Track ad click and redirect to target URL (public)' })
  @ApiParam({ name: 'adId', type: String })
  @ApiQuery({ name: 'redirect', required: false, description: 'Override redirect URL' })
  async trackClickRedirect(
    @Param('adId') adId: string,
    @Query('redirect') redirectParam: string | undefined,
    @Req() req: Request,
    @Res() res: Response,
    @Headers('x-forwarded-for') forwardedFor?: string,
    @Headers('user-agent') userAgent?: string,
    @Headers('referer') referer?: string,
  ) {
    const ip = forwardedFor?.split(',')[0]?.trim() || req.ip || '0.0.0.0';
    const result = await this.advertisementService.trackClick(adId, {
      ip,
      userAgent: userAgent || 'unknown',
      referer: referer || '',
      sessionId: req.query['session'] as string | undefined,
    });
    const redirectUrl = redirectParam || result.targetUrl;
    res.redirect(HttpStatus.FOUND, redirectUrl);
  }

  @Public()
  @Post(':id/impression')
  @ApiOperation({ summary: 'Track ad impression (public)' })
  @ApiParam({ name: 'id', type: String })
  @HttpCode(HttpStatus.OK)
  async trackImpression(
    @Param('id') id: string,
    @Body() dto: TrackImpressionDto,
    @Req() req: Request,
    @Headers('x-forwarded-for') forwardedFor?: string,
  ) {
    const ip = forwardedFor?.split(',')[0]?.trim() || dto.ip || req.ip || '0.0.0.0';
    return this.advertisementService.trackImpression(id, {
      ...dto,
      ip,
    });
  }

  @Public()
  @Post(':id/click')
  @ApiOperation({ summary: 'Track ad click (public JSON endpoint)' })
  @ApiParam({ name: 'id', type: String })
  @HttpCode(HttpStatus.OK)
  async trackClick(
    @Param('id') id: string,
    @Body() dto: TrackClickDto,
    @Req() req: Request,
    @Headers('x-forwarded-for') forwardedFor?: string,
  ) {
    const ip = forwardedFor?.split(',')[0]?.trim() || dto.ip || req.ip || '0.0.0.0';
    return this.advertisementService.trackClick(id, { ...dto, ip });
  }

  @Public()
  @Post(':id/conversion')
  @ApiOperation({ summary: 'Track ad conversion (public)' })
  @ApiParam({ name: 'id', type: String })
  @HttpCode(HttpStatus.OK)
  async trackConversion(
    @Param('id') id: string,
    @Body() dto: TrackConversionDto,
  ) {
    return this.advertisementService.trackConversion(id, dto);
  }

  @Public()
  @Get('serve/:adId/pixel.gif')
  @ApiOperation({ summary: 'Tracking pixel for impression (public)' })
  @ApiParam({ name: 'adId', type: String })
  @ApiResponse({ status: HttpStatus.OK, description: '1x1 transparent GIF' })
  async trackingPixel(
    @Param('adId') adId: string,
    @Req() req: Request,
    @Res() res: Response,
    @Headers('x-forwarded-for') forwardedFor?: string,
    @Headers('user-agent') userAgent?: string,
    @Headers('referer') referer?: string,
  ) {
    const ip = forwardedFor?.split(',')[0]?.trim() || req.ip || '0.0.0.0';
    await this.advertisementService.trackImpression(adId, {
      ip,
      userAgent: userAgent || 'unknown',
      referer: referer || '',
      sessionId: req.query['session'] as string | undefined,
    });
    const pixel = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
    res.writeHead(HttpStatus.OK, {
      'Content-Type': 'image/gif',
      'Content-Length': pixel.length,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    });
    res.end(pixel);
  }
}
