import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { RedisService } from '../../redis/redis.service';

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  private readonly logger = new Logger(CacheInterceptor.name);

  constructor(private redisService: RedisService) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const cacheKey = `cache:${request.method}:${request.url}`;

    if (request.method !== 'GET') {
      return next.handle();
    }

    const cached = await this.redisService.get(cacheKey);
    if (cached) {
      this.logger.debug(`Cache hit: ${cacheKey}`);
      return of(JSON.parse(cached));
    }

    return next.handle().pipe(
      tap(async (data) => {
        await this.redisService.set(cacheKey, JSON.stringify(data), 300);
      }),
    );
  }
}
