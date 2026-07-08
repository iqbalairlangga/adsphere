import { Controller, Post, Body, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { WebhookService } from './webhook.service';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Webhooks')
@Controller('webhooks')
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @Public() @Post('stripe') @ApiOperation({ summary: 'Stripe webhook' })
  async stripe(@Body() event: any) { return this.webhookService.handleStripe(event); }

  @Public() @Post('midtrans') @ApiOperation({ summary: 'Midtrans webhook' })
  async midtrans(@Body() notification: any) { return this.webhookService.handleMidtrans(notification); }

  @Public() @Post('paypal') @ApiOperation({ summary: 'PayPal webhook' })
  async paypal(@Body() event: any) { return this.webhookService.handlePayPal(event); }
}
