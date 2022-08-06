import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { PagingDto } from './paging-dto';
import { SearchSort } from './search.dto';

export class BidHistory extends PagingDto {
  @ApiProperty()
  @Type(() => Number)
  @IsNotEmpty()
  @IsNumber()
  nftId: number;

  @ApiProperty({ example: 1, required: false })
  @Type(() => Number)
  @IsEnum(SearchSort)
  @IsOptional()
  @IsNotEmpty()
  sort: SearchSort;
}
