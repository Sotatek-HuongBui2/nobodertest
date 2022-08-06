import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UpdateVerifyEmailDto {
  @ApiProperty({ required: true })
  @IsString()
  accessToken: string;
}
