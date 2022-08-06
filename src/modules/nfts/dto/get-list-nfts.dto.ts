import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNumber, IsOptional, IsString } from "class-validator";

export class GetListNftsDto {
  // @ApiProperty({ default: 1, required: false })
  // @IsOptional()
  // @IsNumber()
  // @Type(() => Number)
  // isDraft: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  collection: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  network: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  ownerNft: string;

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
}
