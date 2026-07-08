import { Module } from '@nestjs/common';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../redis/redis.service';

@Module({
  controllers: [AnalyticsController],
  providers: [AnalyticsService, PrismaService, RedisService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
