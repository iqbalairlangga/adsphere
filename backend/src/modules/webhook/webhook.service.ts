import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);

  constructor(private readonly prisma: PrismaService) {}

  async handleStripe(event: any) {
    this.logger.log(`Stripe webhook: ${event.type}`);
    return { received: true };
  }

  async handleMidtrans(notification: any) {
    this.logger.log(`Midtrans notification: ${notification.transaction_status}`);
    return { received: true };
  }

  async handlePayPal(event: any) {
    this.logger.log(`PayPal webhook: ${event.event_type}`);
    return { received: true };
  }
}
