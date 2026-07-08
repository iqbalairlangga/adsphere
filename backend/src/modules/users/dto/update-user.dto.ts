import {
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  IsEnum,
  IsEmail,
  IsBoolean,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { RoleType, UserStatus } from '../../../common/constants';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'John Updated' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ example: 'newemail@example.com' })
  @IsOptional()
  @IsEmail({}, { message: 'Invalid email address' })
  email?: string;

  @ApiPropertyOptional({ example: 'https://example.com/avatar.jpg' })
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiPropertyOptional({ enum: RoleType })
  @IsOptional()
  @IsEnum(RoleType)
  role?: RoleType;

  @ApiPropertyOptional({ enum: UserStatus })
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  emailVerified?: boolean;
}
