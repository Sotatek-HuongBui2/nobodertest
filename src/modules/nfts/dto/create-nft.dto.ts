import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Length,
  Min,
  IsString,
  Max,
} from 'class-validator';
import { Nfts } from '../entities/nfts.entity';
import { CategoriesService } from '../../categories/categories.service';
import { Market, NftType, NFT_CATEGORIES, StandardType } from '../enums';
import { CollectionsService } from '../../collections/collections.service';
import { LessThanTotal } from '../../../common/decorators/less-than-total.decorator';
import { User } from '../../users/entities/user.entity';
import { collectionType } from '../../collections/enums';
import _ = require('lodash');
import { NetworkService } from 'src/modules/networks/network.service';
import { NetworkTokensService } from 'src/modules/network-tokens/network-tokens.service';
import { BadRequestException } from '@nestjs/common';
import { CustomErrorMessage } from 'src/common/constants/error-message';

export class CreateNftDto {
  user: User;

  @ApiProperty()
  @Length(1, 1000)
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsOptional()
  description: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  @IsIn([
    NFT_CATEGORIES.ART,
    NFT_CATEGORIES.AUDIO,
    NFT_CATEGORIES.GIF,
    NFT_CATEGORIES.IMAGE,
    NFT_CATEGORIES.VIDEO,
  ])
  category: number;

  @ApiProperty()
  @Min(0)
  @IsNotEmpty()
  price: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  royalty: number;

  @ApiProperty()
  @IsIn([Market.NO_MARKET, Market.COMMON_MARKET, Market.TOP_MARKET])
  @IsOptional()
  market: Market;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  collectionId: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  receiveToken: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  networkId: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  @IsIn([NftType.NONE, NftType.SALE, NftType.AUCTION])
  type: NftType;

  // DTO auction
  @ApiProperty({ required: true })
  @IsOptional()
  @IsNumber()
  startPrice: number;

  @ApiProperty()
  @IsString()
  @IsOptional()
  startTime: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  endTime: string;

  async toEntity(
    categoryService: CategoriesService,
    collectionsService: CollectionsService,
    networkService: NetworkService,
    networkTokensService: NetworkTokensService,
    platformCommission = 0,
  ) {
    const [collection, network] = await Promise.all([
      collectionsService.findOne(this.collectionId),
      networkService.findOne(this.networkId),
    ]);
    const networkTokens = await networkTokensService.findByNetwork(network.id);
    const networkTokensName = networkTokens.map(
      (networkToken) => `${networkToken.tokenName}`,
    );
    if (!networkTokensName.includes(this.receiveToken)) {
      throw new BadRequestException(CustomErrorMessage['NETWORK_TOKEN.WRONG']);
    }

    if (
      this.type === NftType.AUCTION &&
      (!this.startPrice || !this.startTime || !this.endTime)
    ) {
      throw new BadRequestException(CustomErrorMessage['NFT.INVALID_INPUT']);
    }

    if (this.type === NftType.SALE) {
      // TODO
      // check something
    }

    const nft = new Nfts();
    nft.user = new User();
    nft.user.id = this.user.id;
    nft.name = this.name;
    nft.description = this.description;
    nft.category = this.category;
    nft.collections = collection;
    nft.network = network;
    nft.royalty = this.royalty;
    nft.receiveToken = this.receiveToken;
    nft.platformCommission = platformCommission;
    nft.noCopy = 1;
    nft.quantity = 1;
    nft.price = this.type === NftType.AUCTION ? this.startPrice : this.price;
    nft.market = this.market;
    nft.type = this.type;
    nft.standardType = StandardType.ERC_721;
    return nft;
  }
}
