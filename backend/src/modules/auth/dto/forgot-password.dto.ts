import { IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ForgotPasswordDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Registered email address',
  })
  @IsEmail({}, { message: 'Invalid email address' })
  email: string;
}
