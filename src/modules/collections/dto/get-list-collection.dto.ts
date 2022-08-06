import { UsePipes, ValidationPipe } from "@nestjs/common";
import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from "class-validator";
import { CollectionStatus, collectionType } from "../enums";

export class GetListCollectionDto {
  @ApiProperty({ default: 0, required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  page: number;

  @ApiProperty({ default: 1, required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  networkId: number;

  @ApiProperty({ default: 3, required: false })
  @IsOptional()
  @Min(1)
  @Max(100)
  @IsNumber()
  @Type(() => Number)
  limit: number;

  @IsOptional()
  type: collectionType;

  @IsOptional()
  @IsIn([CollectionStatus.DONE,CollectionStatus.PENDING])
  @Type(() => Number)
  status: number;
}
