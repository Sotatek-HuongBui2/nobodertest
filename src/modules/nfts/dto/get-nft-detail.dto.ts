import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNumber, IsOptional, IsString } from "class-validator";

export class GetNftDetailDto {
  @ApiProperty({ default: 'BSC', required: false })
  @IsOptional()
  @IsString()
  networkName: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  collectionAddress: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  nftId: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  nftTokenId: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  userId: number;
}
