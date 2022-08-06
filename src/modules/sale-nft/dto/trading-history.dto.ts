import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNumber, IsOptional, ValidateIf } from 'class-validator';
import { PagingDto } from './paging-dto';
import { SearchTradingSort } from './search.dto';

export class TradingHistory extends PagingDto {
  @ApiProperty()
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  nftId: number;

  @ApiProperty()
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  collectionId: number;

  @ApiProperty({ example: [1, 2], required: false })
  @Type(() => Array)
  @IsOptional()
  @IsArray()
  sort: SearchTradingSort[];
}
