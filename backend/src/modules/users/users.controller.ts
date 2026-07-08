import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from '../../common/constants';

@ApiTags('Users')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all users (admin)' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'role', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'search', required: false })
  async findAll(@Query() query: any) {
    return this.usersService.findAll(query);
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  async getProfile(@CurrentUser() user: any) {
    return this.usersService.findById(user.id);
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get user by ID (admin)' })
  async findById(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update current user profile' })
  async updateProfile(
    @CurrentUser('id') userId: string,
    @Body() dto: { name?: string; avatar?: string },
  ) {
    return this.usersService.updateProfile(userId, dto);
  }

  @Patch(':id/role')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Update user role (admin)' })
  async updateRole(
    @Param('id') id: string,
    @Body('role') role: string,
    @CurrentUser('id') requesterId: string,
  ) {
    return this.usersService.updateRole(id, role, requesterId);
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update user status (super admin)' })
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
    @CurrentUser('id') requesterId: string,
  ) {
    return this.usersService.updateStatus(id, status, requesterId);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Delete user (super admin)' })
  async deleteUser(
    @Param('id') id: string,
    @CurrentUser('id') requesterId: string,
  ) {
    return this.usersService.deleteUser(id, requesterId);
  }
}
