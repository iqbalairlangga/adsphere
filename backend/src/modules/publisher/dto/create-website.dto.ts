import { IsString, MinLength, MaxLength, IsOptional, IsUrl, IsNumber, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateWebsiteDto {
  @ApiProperty({ example: 'https://example.com' })
  @IsUrl({}, { message: 'Invalid website URL' })
  url: string;

  @ApiProperty({ example: 'Example Blog' })
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  name: string;

  @ApiPropertyOptional({ example: 'A blog about technology' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiPropertyOptional({ example: 'Technology' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ example: 50000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  monthlyVisits?: number;
}
