import { Type } from "class-transformer";
import { IsOptional, IsString } from "class-validator";

export class GetInfoCollectionDto {
	@IsOptional()
	@IsString()
	@Type(() => String)
	contractAddress: string;
}
