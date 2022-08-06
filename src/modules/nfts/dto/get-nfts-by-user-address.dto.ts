import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class GetNftByUserAddressDto {
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
  @IsString()
  address: string;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  categoryFilter: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  userId: number;
}
