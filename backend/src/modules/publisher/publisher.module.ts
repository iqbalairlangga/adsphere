import { Module } from '@nestjs/common';
import { PublisherController } from './publisher.controller';
import { PublisherService } from './publisher.service';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [PublisherController],
  providers: [PublisherService, PrismaService],
  exports: [PublisherService],
})
export class PublisherModule {}
