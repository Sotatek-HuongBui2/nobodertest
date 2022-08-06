import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class GetListNftsMarketDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  category?: string;

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
}
