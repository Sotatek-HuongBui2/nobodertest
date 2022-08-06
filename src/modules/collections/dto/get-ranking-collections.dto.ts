import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsOptional } from 'class-validator';
import { CollectionSort } from 'src/modules/collections/enums';
import { NetworkSupport } from 'src/modules/networks/enums';
import { NFT_DURATION } from 'src/modules/nfts/enums';
import { PagingDto } from 'src/modules/sale-nft/dto/paging-dto';

export class GetRankingCollectionsDto extends PagingDto {
  @ApiProperty({ default: 0 })
  @IsOptional()
  @IsEnum(NFT_DURATION)
  @Type(() => Number)
  duration: NFT_DURATION;

  @ApiProperty({ default: 0 })
  @IsOptional()
  @IsEnum(NetworkSupport)
  @Type(() => Number)
  chain: NetworkSupport;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEnum(CollectionSort)
  @Type(() => Number)
  sort?: CollectionSort;
}
