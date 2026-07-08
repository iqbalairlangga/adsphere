import {
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  IsEnum,
  IsNumber,
  Min,
  IsObject,
  IsUrl,
  IsBoolean,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { AdType, AdStatus } from '../../../common/constants';

export class UpdateAdDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  content?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl({})
  mediaUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl({})
  targetUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  dimensions?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  settings?: Record<string, unknown>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  bidAmount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  abTestGroup?: string;

  @ApiPropertyOptional({ enum: AdStatus })
  @IsOptional()
  @IsEnum(AdStatus)
  status?: AdStatus;
}
