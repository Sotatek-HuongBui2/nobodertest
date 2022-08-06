import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateAuctionSession {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsNumber()
  nftId: number;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsNumber()
  startPrice: number;

  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  receiveToken: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  startTime: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  endTime: string;
}
