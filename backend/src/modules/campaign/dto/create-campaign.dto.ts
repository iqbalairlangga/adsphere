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
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CampaignType } from '../../../common/constants';

export class CreateCampaignDto {
  @ApiProperty({ example: 'Summer Sale 2025' })
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  name!: string;

  @ApiPropertyOptional({ example: 'Campaign for summer sales promotion' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiPropertyOptional({ enum: CampaignType, example: CampaignType.DISPLAY })
  @IsOptional()
  @IsEnum(CampaignType)
  type?: CampaignType;

  @ApiProperty({ example: 5000 })
  @IsNumber()
  @Min(0)
  budget!: number;

  @ApiPropertyOptional({ example: 500 })
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

  @ApiPropertyOptional({
    example: {
      countries: ['US', 'UK'],
      devices: ['mobile', 'desktop'],
      ageRange: { min: 18, max: 65 },
      interests: ['technology', 'gaming'],
    },
  })
  @IsOptional()
  @IsObject()
  targeting?: Record<string, unknown>;

  @ApiPropertyOptional({
    example: {
      dayOfWeek: [1, 2, 3, 4, 5],
      startTime: '09:00',
      endTime: '18:00',
      timezone: 'America/New_York',
    },
  })
  @IsOptional()
  @IsObject()
  schedule?: Record<string, unknown>;

  @ApiPropertyOptional({ example: ['summer', 'sale'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
