import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query,
  UseGuards, HttpStatus, HttpCode,
} from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiParam,
  ApiBody, ApiResponse, ApiExtraModels,
} from '@nestjs/swagger';
import {
  IsString, IsOptional, IsEnum, IsNumber, Min, IsDateString,
  IsObject, IsArray, MinLength, MaxLength, IsUUID, IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CampaignService } from './campaign.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { CampaignStatus, CampaignType, UserRole } from '../../common/constants';

class CreateCampaignDto {
  @ApiBody({
    schema: {
      example: {
        name: 'Summer Sale 2025',
        description: 'Campaign for summer sales promotion',
        type: 'DISPLAY',
        budget: 5000,
        dailyBudget: 500,
        startDate: '2025-06-01T00:00:00Z',
        endDate: '2025-08-31T23:59:59Z',
      },
    },
  })
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsEnum(CampaignType)
  type?: CampaignType;

  @IsNumber()
  @Min(0)
  budget: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  dailyBudget?: number;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsObject()
  targeting?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  schedule?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  utmSource?: string;

  @IsOptional()
  @IsString()
  utmMedium?: string;

  @IsOptional()
  @IsString()
  utmCampaign?: string;

  @IsOptional()
  @IsBoolean()
  isATestEnabled?: boolean;
}

class UpdateCampaignDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsEnum(CampaignType)
  type?: CampaignType;

  @IsOptional()
  @IsNumber()
  @Min(0)
  budget?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  dailyBudget?: number;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsObject()
  targeting?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  schedule?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  utmSource?: string;

  @IsOptional()
  @IsString()
  utmMedium?: string;

  @IsOptional()
  @IsString()
  utmCampaign?: string;

  @IsOptional()
  @IsBoolean()
  isATestEnabled?: boolean;
}

class UpdateBudgetDto {
  @IsNumber()
  @Min(0)
  budget: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  dailyBudget?: number;
}

class QueryCampaignDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(CampaignStatus)
  status?: CampaignStatus;

  @IsOptional()
  @IsEnum(CampaignType)
  type?: CampaignType;

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

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;
}

@ApiTags('Campaigns')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('campaigns')
@ApiExtraModels(CreateCampaignDto, UpdateCampaignDto, UpdateBudgetDto, QueryCampaignDto)
export class CampaignController {
  constructor(private readonly campaignService: CampaignService) {}

  @Post()
  @Roles(UserRole.ADVERTISER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create a new campaign' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Campaign created successfully' })
  async create(
    @CurrentUser() user: { id: string; role: string },
    @Body() dto: CreateCampaignDto,
  ) {
    return this.campaignService.create(user.id, dto);
  }

  @Get()
  @Roles(UserRole.ADVERTISER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'List all campaigns with filtering and pagination' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'status', enum: CampaignStatus, required: false })
  @ApiQuery({ name: 'type', enum: CampaignType, required: false })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({ name: 'sortBy', required: false, example: 'createdAt' })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['ASC', 'DESC'] })
  async findAll(
    @CurrentUser() user: { id: string; role: string },
    @Query() query: QueryCampaignDto,
  ) {
    return this.campaignService.findAll(user.id, user.role, query);
  }

  @Get(':id')
  @Roles(UserRole.ADVERTISER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get campaign by ID' })
  @ApiParam({ name: 'id', type: String, description: 'Campaign UUID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Campaign found' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Campaign not found' })
  async findById(
    @CurrentUser() user: { id: string; role: string },
    @Param('id') id: string,
  ) {
    return this.campaignService.findById(user.id, user.role, id);
  }

  @Patch(':id')
  @Roles(UserRole.ADVERTISER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update campaign' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: HttpStatus.OK, description: 'Campaign updated' })
  async update(
    @CurrentUser() user: { id: string; role: string },
    @Param('id') id: string,
    @Body() dto: UpdateCampaignDto,
  ) {
    return this.campaignService.update(user.id, user.role, id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADVERTISER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Archive campaign (soft delete)' })
  @ApiParam({ name: 'id', type: String })
  async remove(
    @CurrentUser() user: { id: string; role: string },
    @Param('id') id: string,
  ) {
    return this.campaignService.remove(user.id, user.role, id);
  }

  @Post(':id/duplicate')
  @Roles(UserRole.ADVERTISER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Duplicate an existing campaign with all ads' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Campaign duplicated' })
  async duplicate(
    @CurrentUser() user: { id: string; role: string },
    @Param('id') id: string,
  ) {
    return this.campaignService.duplicate(user.id, user.role, id);
  }

  @Patch(':id/status')
  @Roles(UserRole.ADVERTISER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update campaign status (pause/resume/complete)' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ schema: { type: 'object', properties: { status: { type: 'string', enum: Object.values(CampaignStatus) } } } })
  async updateStatus(
    @CurrentUser() user: { id: string; role: string },
    @Param('id') id: string,
    @Body('status') status: CampaignStatus,
  ) {
    return this.campaignService.updateStatus(user.id, user.role, id, status);
  }

  @Patch(':id/budget')
  @Roles(UserRole.ADVERTISER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update campaign budget' })
  @ApiParam({ name: 'id', type: String })
  async updateBudget(
    @CurrentUser() user: { id: string; role: string },
    @Param('id') id: string,
    @Body() dto: UpdateBudgetDto,
  ) {
    return this.campaignService.updateBudget(user.id, user.role, id, dto);
  }

  @Get(':id/analytics')
  @Roles(UserRole.ADVERTISER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get campaign analytics and performance metrics' })
  @ApiParam({ name: 'id', type: String })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  async getAnalytics(
    @CurrentUser() user: { id: string; role: string },
    @Param('id') id: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.campaignService.getAnalytics(user.id, user.role, id, startDate, endDate);
  }
}
