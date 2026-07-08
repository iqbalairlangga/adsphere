import { IsEmail, IsString, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'User email address',
  })
  @IsEmail({}, { message: 'Invalid email address' })
  email!: string;

  @ApiProperty({
    example: 'StrongP@ssw0rd!',
    description: 'User password',
  })
  @IsString()
  password!: string;

  @ApiPropertyOptional({
    example: false,
    description: 'Remember me - extends session duration',
  })
  @IsOptional()
  @IsBoolean()
  rememberMe?: boolean;
}
