import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class NftInCollectionDto {

  @ApiProperty({ default: 'BSC', required: true })
  @IsOptional()
  @IsString()
  networkName: string;

  @ApiProperty({ required: true })
  @IsOptional()
  @IsString()
  contractAddress: string;

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

  @ApiProperty({ required: true })
  @IsOptional()
  status: number

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  userId: number;
}

export class NftOwnerCollectionDto {

  @ApiProperty({ default: 'BSC', required: true })
  @IsOptional()
  @IsString()
  networkName: string;

  @ApiProperty({ required: true })
  @IsOptional()
  @IsString()
  contractAddress: string;

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

  @ApiProperty({ required: false })
  userAddress: string
}
