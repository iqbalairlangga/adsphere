import { Controller, Post, Get, Body, Param, UseGuards, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentService } from './payment.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Payments')
@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Post()
  @ApiOperation({ summary: 'Create a payment' })
  async createPayment(@CurrentUser('id') userId: string, @Body() dto: any) {
    return this.paymentService.createPayment(userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Post(':id/stripe')
  @ApiOperation({ summary: 'Process payment with Stripe' })
  async processStripe(@Param('id') id: string) {
    return this.paymentService.processStripePayment(id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Post(':id/midtrans')
  @ApiOperation({ summary: 'Process payment with Midtrans' })
  async processMidtrans(@Param('id') id: string) {
    return this.paymentService.processMidtransPayment(id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Post(':id/paypal')
  @ApiOperation({ summary: 'Process payment with PayPal' })
  async processPayPal(@Param('id') id: string) {
    return this.paymentService.processPayPalPayment(id);
  }

  @Public()
  @Post('webhook/stripe')
  @ApiOperation({ summary: 'Stripe webhook handler' })
  async stripeWebhook(@Body() event: any) {
    return this.paymentService.handleStripeWebhook(event);
  }

  @Public()
  @Post('webhook/midtrans')
  @ApiOperation({ summary: 'Midtrans notification handler' })
  async midtransWebhook(@Body() notification: any) {
    return this.paymentService.handleMidtransNotification(notification);
  }

  @Public()
  @Post('webhook/paypal')
  @ApiOperation({ summary: 'PayPal webhook handler' })
  async paypalWebhook(@Body() event: any) {
    return this.paymentService.handlePayPalWebhook(event);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Post(':id/refund')
  @ApiOperation({ summary: 'Refund a payment' })
  async refund(
    @Param('id') id: string,
    @Body('amount') amount: number,
    @Body('reason') reason: string,
  ) {
    return this.paymentService.refundPayment(id, amount, reason);
  }
}
