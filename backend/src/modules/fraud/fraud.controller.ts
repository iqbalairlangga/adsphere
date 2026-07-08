import { Controller, Get, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FraudService } from './fraud.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from '../../common/constants';

@ApiTags('Fraud Detection')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
@Controller('fraud-detection')
export class FraudController {
  constructor(private readonly fraudService: FraudService) {}

  @Get()
  @ApiOperation({ summary: 'Get fraud detections (admin)' })
  async findAll(@Query() query: any) {
    return this.fraudService.getFraudDetections(query);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update fraud detection status' })
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
    @Body('resolvedBy') resolvedBy: string,
  ) {
    return this.fraudService.updateStatus(id, status, resolvedBy);
  }
}
