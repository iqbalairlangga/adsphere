import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class ThrottleGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, unknown>): Promise<string> {
    const clientIp = req.ip as string || (req.connection as Record<string, unknown>)?.remoteAddress as string || 'unknown';
    return clientIp;
  }
}
