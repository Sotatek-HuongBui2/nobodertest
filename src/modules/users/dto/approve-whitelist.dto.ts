import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Length } from 'class-validator';
export class RequestWhitelistDto {
  @ApiProperty({ required: true })
  @IsNumber()
  networkId: number;
}
