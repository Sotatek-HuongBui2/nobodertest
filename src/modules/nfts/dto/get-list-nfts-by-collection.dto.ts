import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class GetListNftsByCollectionDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  collectionId?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  collectionAddress?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  currentNftId?: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsString()
  networkId: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value} ) => value === 'true')
  isRandom?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  userId?: string;

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
