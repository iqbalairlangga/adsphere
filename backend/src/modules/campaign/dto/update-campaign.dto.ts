import {
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  IsEnum,
  IsNumber,
  Min,
  IsDateString,
  IsObject,
  IsArray,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CampaignStatus, CampaignType } from '../../../common/constants';

export class UpdateCampaignDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiPropertyOptional({ enum: CampaignStatus })
  @IsOptional()
  @IsEnum(CampaignStatus)
  status?: CampaignStatus;

  @ApiPropertyOptional({ enum: CampaignType })
  @IsOptional()
  @IsEnum(CampaignType)
  type?: CampaignType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  budget?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  dailyBudget?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  targeting?: Record<string, unknown>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  schedule?: Record<string, unknown>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
