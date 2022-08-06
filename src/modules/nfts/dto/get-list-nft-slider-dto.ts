import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional } from 'class-validator';

export class GetListNftsSliderDto {
  @ApiProperty()
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  page: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  limit: number;
}
