import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  const configService = app.get(ConfigService);
  const logger = new Logger('Bootstrap');

  app.setGlobalPrefix('api/v1');

  app.use(helmet());
  app.use(compression());
  app.use(cookieParser());

  app.enableCors({
    origin: configService.get<string[]>('cors.origins') || ['http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key', 'X-CSRF-Token'],
    exposedHeaders: ['X-RateLimit-Remaining', 'X-RateLimit-Reset'],
  });

  app.use(
    rateLimit({
      windowMs: 60 * 1000,
      max: 100,
      standardHeaders: true,
      legacyHeaders: false,
      message: { statusCode: 429, message: 'Too many requests, please try again later.' },
    }),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new LoggingInterceptor(), new ResponseInterceptor());

  const swaggerConfig = new DocumentBuilder()
    .setTitle('AdSphere API')
    .setDescription('Enterprise Advertising Platform API')
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'access-token',
    )
    .addApiKey({ type: 'apiKey', in: 'header', name: 'X-API-Key' }, 'api-key')
    .addTag('Auth', 'Authentication endpoints')
    .addTag('Users', 'User management')
    .addTag('Campaigns', 'Campaign management')
    .addTag('Advertisements', 'Ad creative management')
    .addTag('Analytics', 'Analytics and reporting')
    .addTag('Payments', 'Payment processing')
    .addTag('Publisher', 'Publisher management')
    .addTag('Admin', 'Administration')
    .setContact('AdSphere Team', 'https://adsphere.io', 'support@adsphere.io')
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });

  const port = configService.get<number>('port', 4000);
  await app.listen(port);
  logger.log(`Server running on http://localhost:${port}`);
  logger.log(`Swagger docs at http://localhost:${port}/docs`);
}
bootstrap();
