import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Length } from 'class-validator';
export class VerifyUserDto {
  @ApiProperty({ required: true })
  @IsString()
  account: string;
}
