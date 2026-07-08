import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class WalletService {
  private readonly logger = new Logger(WalletService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getBalance(userId: string) {
    let wallet = await this.prisma.wallet.findUnique({ where: { userId } });
    if (!wallet) {
      wallet = await this.prisma.wallet.create({
        data: { userId, balance: 0, lockedBalance: 0 },
      });
    }
    return {
      balance: Number(wallet.balance),
      lockedBalance: Number(wallet.lockedBalance),
      availableBalance: Number(wallet.balance) - Number(wallet.lockedBalance),
      currency: wallet.currency,
    };
  }

  async getTransactions(userId: string, page = 1, limit = 10) {
    const wallet = await this.prisma.wallet.findUnique({ where: { userId } });
    if (!wallet) throw new NotFoundException('Wallet not found');

    const skip = (page - 1) * limit;
    const [transactions, total] = await Promise.all([
      this.prisma.walletTransaction.findMany({
        where: { walletId: wallet.id },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.walletTransaction.count({ where: { walletId: wallet.id } }),
    ]);

    return {
      data: transactions.map((t) => ({
        ...t,
        amount: Number(t.amount),
        balanceBefore: Number(t.balanceBefore),
        balanceAfter: Number(t.balanceAfter),
      })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async deposit(userId: string, amount: number, reference?: string) {
    if (amount <= 0) throw new BadRequestException('Amount must be positive');

    const wallet = await this.prisma.wallet.upsert({
      where: { userId },
      create: { userId, balance: amount },
      update: { balance: { increment: amount } },
    });

    await this.prisma.walletTransaction.create({
      data: {
        walletId: wallet.id,
        type: 'DEPOSIT',
        amount,
        currency: 'USD',
        balanceBefore: Number(wallet.balance) - amount,
        balanceAfter: Number(wallet.balance),
        description: reference || 'Wallet deposit',
        referenceId: reference,
        referenceType: 'deposit',
      },
    });

    this.logger.log(`Deposited ${amount} to wallet ${wallet.id}`);
    return { balance: Number(wallet.balance) };
  }

  async withdraw(userId: string, amount: number, method: string, accountInfo: any) {
    if (amount <= 0) throw new BadRequestException('Amount must be positive');

    const wallet = await this.prisma.wallet.findUnique({ where: { userId } });
    if (!wallet) throw new NotFoundException('Wallet not found');

    const available = Number(wallet.balance) - Number(wallet.lockedBalance);
    if (amount > available) throw new BadRequestException('Insufficient balance');

    const fee = Math.max(amount * 0.02, 0.5);
    const netAmount = amount - fee;

    const withdraw = await this.prisma.withdraw.create({
      data: {
        userId,
        walletId: wallet.id,
        amount,
        fee,
        netAmount,
        currency: 'USD',
        method,
        accountInfo,
        status: 'PENDING',
      },
    });

    await this.prisma.wallet.update({
      where: { id: wallet.id },
      data: { lockedBalance: { increment: amount } },
    });

    return withdraw;
  }

  async processWithdrawal(withdrawalId: string, approvedBy: string, approve: boolean) {
    const withdrawal = await this.prisma.withdraw.findUnique({ where: { id: withdrawalId } });
    if (!withdrawal) throw new NotFoundException('Withdrawal not found');

    if (approve) {
      await this.prisma.withdraw.update({
        where: { id: withdrawalId },
        data: { status: 'SUCCESS', approvedBy, approvedAt: new Date() },
      });

      await this.prisma.wallet.update({
        where: { id: withdrawal.walletId },
        data: {
          lockedBalance: { decrement: Number(withdrawal.amount) },
          balance: { decrement: Number(withdrawal.amount) },
        },
      });

      await this.prisma.walletTransaction.create({
        data: {
          walletId: withdrawal.walletId,
          type: 'WITHDRAWAL',
          amount: Number(withdrawal.amount),
          currency: withdrawal.currency,
          balanceBefore: 0,
          balanceAfter: 0,
          description: `Withdrawal ${withdrawal.id}`,
          referenceId: withdrawal.id,
          referenceType: 'withdrawal',
        },
      });
    } else {
      await this.prisma.withdraw.update({
        where: { id: withdrawalId },
        data: { status: 'FAILED' },
      });

      await this.prisma.wallet.update({
        where: { id: withdrawal.walletId },
        data: { lockedBalance: { decrement: Number(withdrawal.amount) } },
      });
    }

    return { message: approve ? 'Withdrawal approved' : 'Withdrawal rejected' };
  }
}
