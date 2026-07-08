import {
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  IsEnum,
  IsNumber,
  Min,
  IsObject,
  IsUUID,
  IsUrl,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AdType } from '../../../common/constants';

export class CreateAdDto {
  @ApiProperty()
  @IsUUID('4')
  campaignId!: string;

  @ApiProperty({ enum: AdType, example: AdType.BANNER })
  @IsEnum(AdType)
  type!: AdType;

  @ApiProperty({ example: 'Summer Sale Banner 728x90' })
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  title!: string;

  @ApiPropertyOptional({ example: 'Click here for amazing summer deals!' })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  content?: string;

  @ApiPropertyOptional({ example: 'https://example.com/banner.jpg' })
  @IsOptional()
  @IsUrl({}, { message: 'Invalid media URL' })
  mediaUrl?: string;

  @ApiPropertyOptional({ example: 'https://example.com/landing' })
  @IsOptional()
  @IsUrl({}, { message: 'Invalid target URL' })
  targetUrl?: string;

  @ApiPropertyOptional({ example: '728x90' })
  @IsOptional()
  @IsString()
  dimensions?: string;

  @ApiPropertyOptional({
    example: {
      autoplay: true,
      loop: false,
      mute: true,
      ctaText: 'Shop Now',
    },
  })
  @IsOptional()
  @IsObject()
  settings?: Record<string, unknown>;

  @ApiPropertyOptional({ example: 0.5 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  bidAmount?: number;

  @ApiPropertyOptional({ example: 'variant_a' })
  @IsOptional()
  @IsString()
  abTestGroup?: string;
}
