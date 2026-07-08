import {
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  IsEnum,
  IsNumber,
  Min,
  IsObject,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AdType } from '../../../common/constants';

export class CreateAdUnitDto {
  @ApiProperty()
  @IsString()
  websiteId!: string;

  @ApiProperty({ example: 'Header Banner' })
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  name!: string;

  @ApiPropertyOptional({ enum: AdType, example: AdType.BANNER })
  @IsOptional()
  @IsEnum(AdType)
  type?: AdType;

  @ApiPropertyOptional({ example: '728x90' })
  @IsOptional()
  @IsString()
  dimensions?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  settings?: Record<string, unknown>;

  @ApiPropertyOptional({ example: 0.1 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  floorPrice?: number;
}
