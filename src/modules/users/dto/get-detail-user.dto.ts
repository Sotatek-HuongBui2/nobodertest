import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
export class GetDetailUserDto {
  @ApiProperty({ required: true })
  @IsString()
  address: string;
}
