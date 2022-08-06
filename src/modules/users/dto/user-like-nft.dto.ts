import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Length } from 'class-validator';
import { BaseEntity } from 'typeorm';
export class UserLikeNftDto extends BaseEntity {
  @ApiProperty({ required: true })
  @IsNumber()
  nftId: number;

  @ApiProperty({ required: true })
  @IsNumber()
  status: number;
}
