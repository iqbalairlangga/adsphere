import { Controller, Get, Post, Query, Param, UseGuards, Res, Header } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Response } from 'express';
import { AnalyticsService } from './analytics.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Analytics')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get dashboard analytics' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  async getDashboard(
    @CurrentUser() user: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const dateRange = startDate && endDate
      ? { start: new Date(startDate), end: new Date(endDate) }
      : undefined;
    return this.analyticsService.getDashboardStats(user.id, dateRange, user.role);
  }

  @Get('realtime')
  @ApiOperation({ summary: 'Get realtime analytics' })
  async getRealtime(@CurrentUser('id') userId: string) {
    return this.analyticsService.getRealtimeStats(userId);
  }

  @Get('charts')
  @ApiOperation({ summary: 'Get chart data' })
  @ApiQuery({ name: 'period', enum: ['7d', '30d', '90d', '1y'] })
  @ApiQuery({ name: 'metric', required: false })
  async getChartData(
    @CurrentUser('id') userId: string,
    @Query('period') period: '7d' | '30d' | '90d' | '1y' = '30d',
    @Query('metric') metric = 'impressions',
  ) {
    return this.analyticsService.getChartData(userId, period, metric);
  }

  @Get('campaign/:campaignId')
  @ApiOperation({ summary: 'Get campaign analytics' })
  async getCampaignAnalytics(@Param('campaignId') campaignId: string) {
    return this.analyticsService.getCampaignAnalytics(campaignId);
  }

  @Get('export/csv')
  @ApiOperation({ summary: 'Export analytics as CSV' })
  @Header('Content-Type', 'text/csv')
  @Header('Content-Disposition', 'attachment; filename=analytics.csv')
  async exportCsv(
    @CurrentUser('id') userId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Res() res: Response,
  ) {
    const csv = await this.analyticsService.exportCsv(userId, {
      start: new Date(startDate),
      end: new Date(endDate),
    });
    res.send(csv);
  }

  @Get('export/excel')
  @ApiOperation({ summary: 'Export analytics as Excel' })
  @Header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  @Header('Content-Disposition', 'attachment; filename=analytics.xlsx')
  async exportExcel(
    @CurrentUser('id') userId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Res() res: Response,
  ) {
    const buffer = await this.analyticsService.exportExcel(userId, {
      start: new Date(startDate),
      end: new Date(endDate),
    });
    res.send(buffer);
  }

  @Get('export/pdf')
  @ApiOperation({ summary: 'Export analytics as PDF' })
  @Header('Content-Type', 'application/pdf')
  @Header('Content-Disposition', 'attachment; filename=analytics.pdf')
  async exportPdf(
    @CurrentUser('id') userId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Res() res: Response,
  ) {
    const buffer = await this.analyticsService.exportPdf(userId, {
      start: new Date(startDate),
      end: new Date(endDate),
    });
    res.send(buffer);
  }
}
