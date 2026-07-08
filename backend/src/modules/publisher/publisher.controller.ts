import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PublisherService } from './publisher.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Publisher')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('publisher')
export class PublisherController {
  constructor(private readonly publisherService: PublisherService) {}

  @Post('websites') @ApiOperation({ summary: 'Register a website' })
  async createWebsite(@CurrentUser('id') userId: string, @Body() dto: any) {
    return this.publisherService.createWebsite(userId, dto);
  }

  @Get('websites') @ApiOperation({ summary: 'Get my websites' })
  async getWebsites(@CurrentUser('id') userId: string) {
    return this.publisherService.getWebsites(userId);
  }

  @Get('websites/:id') @ApiOperation({ summary: 'Get website details' })
  async getWebsite(@Param('id') id: string) {
    return this.publisherService.getWebsite(id);
  }

  @Post('websites/:id/ad-units') @ApiOperation({ summary: 'Create ad unit' })
  async createAdUnit(@Param('id') id: string, @Body() dto: any) {
    return this.publisherService.createAdUnit(id, dto);
  }

  @Get('websites/:id/ad-units') @ApiOperation({ summary: 'Get ad units' })
  async getAdUnits(@Param('id') id: string) {
    return this.publisherService.getAdUnits(id);
  }

  @Get('earnings') @ApiOperation({ summary: 'Get publisher earnings' })
  async getEarnings(@CurrentUser('id') userId: string) {
    return this.publisherService.getPublisherEarnings(userId);
  }
}
