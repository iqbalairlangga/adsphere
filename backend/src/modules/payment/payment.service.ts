import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import Stripe from 'stripe';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  private stripe: any;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    const stripeKey = this.configService.get<string>('payment.stripe.secretKey');
    if (stripeKey) {
      try {
        this.stripe = new Stripe(stripeKey, { apiVersion: '2025-02-24.acacia' } as any);
      } catch { this.logger.warn('Stripe not available'); }
    }
  }

  async createPayment(userId: string, dto: { amount: number; currency?: string; provider: string; description?: string }) {
    const wallet = await this.prisma.wallet.findUnique({ where: { userId } });
    if (!wallet) throw new BadRequestException('Wallet not found');

    const invoice = await this.prisma.invoice.create({
      data: {
        userId,
        number: `INV-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        amount: dto.amount,
        currency: dto.currency || 'USD',
        description: dto.description,
        status: 'PENDING',
        type: 'payment',
        dueDate: new Date(Date.now() + 7 * 86400000),
      },
    });

    const payment = await this.prisma.payment.create({
      data: {
        userId,
        invoiceId: invoice.id,
        amount: dto.amount,
        currency: dto.currency || 'USD',
        provider: dto.provider as any,
        status: 'PENDING',
        description: dto.description,
      },
    });

    return { payment, invoice };
  }

  async processStripePayment(paymentId: string) {
    const payment = await this.prisma.payment.findUnique({ where: { id: paymentId } });
    if (!payment) throw new BadRequestException('Payment not found');

    if (!this.stripe) throw new BadRequestException('Stripe not configured');

    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: Math.round(Number(payment.amount) * 100),
      currency: payment.currency.toLowerCase(),
      metadata: { paymentId: payment.id },
    });

    await this.prisma.payment.update({
      where: { id: paymentId },
      data: { providerPaymentId: paymentIntent.id },
    });

    return { clientSecret: paymentIntent.client_secret, paymentIntentId: paymentIntent.id };
  }

  async processMidtransPayment(paymentId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: { user: true },
    });
    if (!payment) throw new BadRequestException('Payment not found');

    const serverKey = this.configService.get<string>('payment.midtrans.serverKey');
    if (!serverKey) throw new BadRequestException('Midtrans not configured');

    const auth = Buffer.from(serverKey + ':').toString('base64');
    const response = await fetch('https://app.sandbox.midtrans.com/snap/v1/transactions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${auth}`,
      },
      body: JSON.stringify({
        transaction_details: {
          order_id: payment.id,
          gross_amount: Number(payment.amount),
        },
        customer_details: {
          email: payment.user.email,
          first_name: payment.user.name,
        },
      }),
    });

    const result: any = await response.json();

    await this.prisma.payment.update({
      where: { id: paymentId },
      data: { providerPaymentId: result.transaction_id },
    });

    return { redirectUrl: result.redirect_url, token: result.token };
  }

  async processPayPalPayment(paymentId: string) {
    const payment = await this.prisma.payment.findUnique({ where: { id: paymentId } });
    if (!payment) throw new BadRequestException('Payment not found');

    const clientId = this.configService.get<string>('payment.paypal.clientId');
    const clientSecret = this.configService.get<string>('payment.paypal.clientSecret');
    if (!clientId || !clientSecret) throw new BadRequestException('PayPal not configured');

    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    const tokenRes = await fetch('https://api-m.sandbox.paypal.com/v1/oauth2/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });
    const tokenData: any = await tokenRes.json();

    const orderRes = await fetch('https://api-m.sandbox.paypal.com/v2/checkout/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenData.access_token}`,
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [{
          reference_id: payment.id,
          amount: { currency_code: payment.currency, value: payment.amount.toString() },
        }],
      }),
    });
    const order: any = await orderRes.json();

    await this.prisma.payment.update({
      where: { id: paymentId },
      data: { providerPaymentId: order.id },
    });

    return { orderId: order.id, status: order.status };
  }

  async handleStripeWebhook(event: any) {
    const paymentIntentId = event.data.object?.payment_intent || event.data.object?.id;
    if (!paymentIntentId) return;

    const payment = await this.prisma.payment.findFirst({
      where: { providerPaymentId: paymentIntentId },
    });
    if (!payment) return;

    switch (event.type) {
      case 'payment_intent.succeeded':
        await this.completePayment(payment.id);
        break;
      case 'payment_intent.payment_failed':
        await this.prisma.payment.update({
          where: { id: payment.id },
          data: { status: 'FAILED' },
        });
        break;
    }
  }

  async handleMidtransNotification(notification: any) {
    const payment = await this.prisma.payment.findFirst({
      where: { providerPaymentId: notification.transaction_id },
    });
    if (!payment) return;

    if (notification.transaction_status === 'capture' || notification.transaction_status === 'settlement') {
      await this.completePayment(payment.id);
    } else if (notification.transaction_status === 'deny' || notification.transaction_status === 'expire') {
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'FAILED' },
      });
    }
  }

  async handlePayPalWebhook(event: any) {
    const orderId = event.resource?.id;
    if (!orderId) return;

    const payment = await this.prisma.payment.findFirst({
      where: { providerPaymentId: orderId },
    });
    if (!payment) return;

    if (event.event_type === 'CHECKOUT.ORDER.APPROVED' || event.event_type === 'PAYMENT.CAPTURE.COMPLETED') {
      await this.completePayment(payment.id);
    }
  }

  private async completePayment(paymentId: string) {
    const payment = await this.prisma.payment.update({
      where: { id: paymentId },
      data: { status: 'SUCCESS', paidAt: new Date() },
    });

    await this.prisma.invoice.update({
      where: { id: payment.invoiceId! },
      data: { status: 'SUCCESS', paidAt: new Date() },
    });

    await this.prisma.wallet.upsert({
      where: { userId: payment.userId },
      create: { userId: payment.userId, balance: payment.amount },
      update: { balance: { increment: payment.amount } },
    });

    await this.prisma.walletTransaction.create({
      data: {
        walletId: payment.userId,
        type: 'DEPOSIT',
        amount: payment.amount,
        currency: payment.currency,
        balanceBefore: 0,
        balanceAfter: Number(payment.amount),
        description: `Payment ${payment.id}`,
        referenceId: payment.id,
        referenceType: 'payment',
      },
    });

    this.logger.log(`Payment completed: ${paymentId}`);
  }

  async refundPayment(paymentId: string, amount?: number, reason?: string) {
    const payment = await this.prisma.payment.findUnique({ where: { id: paymentId } });
    if (!payment || payment.status !== 'SUCCESS') throw new BadRequestException('Payment cannot be refunded');

    const refundAmount = amount || Number(payment.amount);

    const refund = await this.prisma.refund.create({
      data: {
        paymentId,
        amount: refundAmount,
        currency: payment.currency,
        reason,
        status: 'SUCCESS',
      },
    });

    await this.prisma.payment.update({
      where: { id: paymentId },
      data: { status: 'REFUNDED' },
    });

    await this.prisma.wallet.update({
      where: { userId: payment.userId },
      data: { balance: { decrement: refundAmount } },
    });

    return refund;
  }
}
