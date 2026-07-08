import { IsString, MinLength, MaxLength, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePermissionDto {
  @ApiProperty({ example: 'campaign:create' })
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({ example: 'Allows creating new campaigns' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({ example: 'campaign' })
  @IsString()
  resource: string;

  @ApiProperty({ example: 'create' })
  @IsString()
  action: string;
}
