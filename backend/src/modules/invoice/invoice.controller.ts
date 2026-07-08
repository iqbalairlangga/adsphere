import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { InvoiceService } from './invoice.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from '../../common/constants';

@ApiTags('Invoices')
@Controller('invoices')
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Post() @UseGuards(JwtAuthGuard) @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Generate invoice' })
  async create(@CurrentUser('id') userId: string, @Body() dto: any) { return this.invoiceService.generateInvoice(userId, dto); }

  @Get() @UseGuards(JwtAuthGuard, RolesGuard) @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN) @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get all invoices (admin)' })
  async findAll(@Query('page') page?: number, @Query('limit') limit?: number) { return this.invoiceService.getAll(page, limit); }

  @Get(':id') @UseGuards(JwtAuthGuard) @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get invoice by ID' })
  async findById(@Param('id') id: string) { return this.invoiceService.getById(id); }

  @Patch(':id/pay') @UseGuards(JwtAuthGuard, RolesGuard) @Roles(UserRole.SUPER_ADMIN) @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Mark invoice as paid (admin)' })
  async markAsPaid(@Param('id') id: string) { return this.invoiceService.markAsPaid(id); }
}
