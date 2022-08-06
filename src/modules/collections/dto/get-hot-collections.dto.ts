import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, Max, Min } from 'class-validator';

export class GetHotCollectionsDto {
  @ApiProperty({ default: 1, required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  page: number;

  @ApiProperty({ default: 5, required: false })
  @IsOptional()
  @Min(1)
  @Max(100)
  @IsNumber()
  @Type(() => Number)
  limit: number;
}
