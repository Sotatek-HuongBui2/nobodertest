import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class PlaceBidAuctionDto {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsNumber()
  price: number;

  fromUser: { id: number; userName: string };
  toUser: { id: number; userName: string };
}
