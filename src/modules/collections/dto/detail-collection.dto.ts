import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class DetailCollectionDto {

  @ApiProperty({ default: 'BSC', required: true })
  @IsOptional()
  @IsString()
  networkName: string;

  @ApiProperty({ required: true })
  @IsOptional()
  @IsString()
  contractAddress: string;

  @ApiProperty({ required: true })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  isUpdate: number;
}
