import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { PrismaService } from './prisma/prisma.service';
import { RedisService } from './redis/redis.service';

import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import redisConfig from './config/redis.config';
import authConfig from './config/auth.config';
import paymentConfig from './config/payment.config';

import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { RolesModule } from './modules/roles/roles.module';
import { CampaignModule } from './modules/campaign/campaign.module';
import { AdvertisementModule } from './modules/advertisement/advertisement.module';
import { PublisherModule } from './modules/publisher/publisher.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { PaymentModule } from './modules/payment/payment.module';
import { WalletModule } from './modules/wallet/wallet.module';
import { BillingModule } from './modules/billing/billing.module';
import { InvoiceModule } from './modules/invoice/invoice.module';
import { NotificationModule } from './modules/notification/notification.module';
import { AuditModule } from './modules/audit/audit.module';
import { FraudModule } from './modules/fraud/fraud.module';
import { SettingsModule } from './modules/settings/settings.module';
import { UploadModule } from './modules/upload/upload.module';
import { ReportModule } from './modules/report/report.module';
import { SearchModule } from './modules/search/search.module';
import { WebhookModule } from './modules/webhook/webhook.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, redisConfig, authConfig, paymentConfig],
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        throttlers: [{
          ttl: config.get<number>('THROTTLE_TTL', 60),
          limit: config.get<number>('THROTTLE_LIMIT', 100),
        }],
      }),
    }),
    AuthModule,
    UsersModule,
    RolesModule,
    CampaignModule,
    AdvertisementModule,
    PublisherModule,
    AnalyticsModule,
    PaymentModule,
    WalletModule,
    BillingModule,
    InvoiceModule,
    NotificationModule,
    AuditModule,
    FraudModule,
    SettingsModule,
    UploadModule,
    ReportModule,
    SearchModule,
    WebhookModule,
  ],
  providers: [
    PrismaService,
    RedisService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
  exports: [PrismaService, RedisService],
})
export class AppModule {}
