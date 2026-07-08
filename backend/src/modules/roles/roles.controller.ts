import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RolesService } from './roles.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from '../../common/constants';

@ApiTags('Roles')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN)
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get() @ApiOperation({ summary: 'Get all roles' }) async findAll() { return this.rolesService.findAll(); }
  @Get(':id') @ApiOperation({ summary: 'Get role by ID' }) async findById(@Param('id') id: string) { return this.rolesService.findById(id); }
  @Post() @ApiOperation({ summary: 'Create role' }) async create(@Body() dto: any) { return this.rolesService.create(dto); }
  @Patch(':id') @ApiOperation({ summary: 'Update role' }) async update(@Param('id') id: string, @Body() dto: any) { return this.rolesService.update(id, dto); }
  @Delete(':id') @ApiOperation({ summary: 'Delete role' }) async delete(@Param('id') id: string) { return this.rolesService.delete(id); }
  @Post('assign') @ApiOperation({ summary: 'Assign role to user' }) async assignRole(@Body() dto: { userId: string; roleId: string }, @CurrentUser('id') adminId: string) {
    return this.rolesService.assignRole(dto.userId, dto.roleId, adminId);
  }
  @Post('remove') @ApiOperation({ summary: 'Remove role from user' }) async removeRole(@Body() dto: { userId: string; roleId: string }) {
    return this.rolesService.removeRole(dto.userId, dto.roleId);
  }
}
