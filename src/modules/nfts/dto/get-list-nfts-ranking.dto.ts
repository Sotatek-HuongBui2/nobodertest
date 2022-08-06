import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsEnum, IsNumber, IsOptional, IsString } from "class-validator";
import { NFT_DURATION } from "../enums";

export class GetListNftsRankingDto {

  @ApiProperty({ default: 1})
  @IsOptional()
  @IsEnum(NFT_DURATION)
  @Type(() => Number)
  duration: NFT_DURATION;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  userId: string;

  @ApiProperty({ default: 1})
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  page: number;

  @ApiProperty({ default: 5 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  limit: number;
}
