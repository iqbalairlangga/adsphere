import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BillingService } from './billing.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Billing')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Get('history') @ApiOperation({ summary: 'Get billing history' })
  async getHistory(@CurrentUser('id') userId: string, @Query('page') page?: number, @Query('limit') limit?: number) {
    return this.billingService.getBillingHistory(userId, page, limit);
  }

  @Get('invoices/:id') @ApiOperation({ summary: 'Get invoice details' })
  async getInvoice(@Param('id') id: string) { return this.billingService.getInvoice(id); }

  @Get('usage') @ApiOperation({ summary: 'Get current usage summary' })
  async getUsage(@CurrentUser('id') userId: string) { return this.billingService.getUsageSummary(userId); }
}
