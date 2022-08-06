import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class GetAllNftsMarketDto {
  @ApiProperty()
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  pageIndex: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  pageSize: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  sortFilter: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  categoryFilter: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  userId?: string;
}
