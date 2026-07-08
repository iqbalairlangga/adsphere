import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReportService } from './report.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from '../../common/constants';

@ApiTags('Reports')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('reports')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Get('campaign/:id') @Roles(UserRole.ADVERTISER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Generate campaign report' }) async campaignReport(@Param('id') id: string) { return this.reportService.generateCampaignReport(id); }

  @Get('publisher/:id') @Roles(UserRole.PUBLISHER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Generate publisher report' }) async publisherReport(@Param('id') id: string) { return this.reportService.generatePublisherReport(id); }

  @Get('system') @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Generate system report (super admin)' }) async systemReport() { return this.reportService.generateSystemReport(); }
}
