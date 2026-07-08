import { IsString, MinLength, MaxLength, IsOptional, IsArray, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRoleDto {
  @ApiProperty({ example: 'Campaign Manager' })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  name: string;

  @ApiPropertyOptional({ example: 'Manages advertising campaigns' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({ example: ['campaign:create', 'campaign:read'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissions?: string[];
}
