import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { WalletService } from './wallet.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from '../../common/constants';

@ApiTags('Wallet')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get('balance')
  @ApiOperation({ summary: 'Get wallet balance' })
  async getBalance(@CurrentUser('id') userId: string) {
    return this.walletService.getBalance(userId);
  }

  @Get('transactions')
  @ApiOperation({ summary: 'Get wallet transactions' })
  async getTransactions(
    @CurrentUser('id') userId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.walletService.getTransactions(userId, page, limit);
  }

  @Post('deposit')
  @ApiOperation({ summary: 'Deposit to wallet' })
  async deposit(
    @CurrentUser('id') userId: string,
    @Body('amount') amount: number,
    @Body('reference') reference?: string,
  ) {
    return this.walletService.deposit(userId, amount, reference);
  }

  @Post('withdraw')
  @ApiOperation({ summary: 'Request withdrawal' })
  async withdraw(
    @CurrentUser('id') userId: string,
    @Body() dto: { amount: number; method: string; accountInfo: any },
  ) {
    return this.walletService.withdraw(userId, dto.amount, dto.method, dto.accountInfo);
  }

  @Post('withdraw/:id/process')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Process withdrawal (admin)' })
  async processWithdrawal(
    @Param('id') id: string,
    @CurrentUser('id') adminId: string,
    @Body('approve') approve: boolean,
  ) {
    return this.walletService.processWithdrawal(id, adminId, approve);
  }
}
