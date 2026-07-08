import { Controller, Get, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from '../../common/constants';

@ApiTags('Settings')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN)
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get() @ApiOperation({ summary: 'Get all settings' }) async getAll() { return this.settingsService.getAll(); }
  @Get(':key') @ApiOperation({ summary: 'Get setting by key' }) async get(@Param('key') key: string) { return this.settingsService.get(key); }
  @Post() @ApiOperation({ summary: 'Update setting' }) async set(@Body() dto: { key: string; value: any; group?: string; type?: string }) {
    return this.settingsService.set(dto.key, dto.value, dto.group, dto.type);
  }
  @Delete(':key') @ApiOperation({ summary: 'Delete setting' }) async delete(@Param('key') key: string) { return this.settingsService.delete(key); }
}
