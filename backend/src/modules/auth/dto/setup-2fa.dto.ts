import { IsOptional, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class Setup2faDto {
  @ApiPropertyOptional({
    description: 'Whether to enable or disable 2FA',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  enable?: boolean;
}
