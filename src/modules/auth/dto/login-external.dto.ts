import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional } from 'class-validator';

export class LoginExternalDto {
  @ApiProperty({ required: true, description: 'Signature' })
  signature: string;

  @ApiProperty({ required: true, description: 'Address' })
  address: string;

  @ApiProperty({ required: false, description: 'Email', default: null })
  @IsOptional()
  @IsEmail()
  email: string;
}
