import { ApiProperty } from '@nestjs/swagger';
import { BadRequestException } from '@nestjs/common';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsNumber,
  Max,
} from 'class-validator';
import { SaleNft } from '../entities/sale-nft.entity';
import { IsCreated, NftStatus, NftType, StandardType } from '../../nfts/enums';
import { IsExistInviteCode } from '../../../common/decorators/exit-referral-code.decorator';
import { SaleNftStatus, SaleNftType } from '../const';
import { NetworkTokensService } from 'src/modules/network-tokens/network-tokens.service';
import { CustomErrorMessage } from 'src/common/constants/error-message';
import { Collection } from 'src/modules/collections/entities/collections.entity';
import { UserService } from 'src/modules/users/user.service';

export class CreateSaleNftDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  price: number;

  @ApiProperty()
  @IsNotEmpty()
  @Max(400)
  quantity: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  networkTokenId: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  nftId: number;

  @ApiProperty()
  expried: string;

  receiveToken: string;

  rawTransactionId: number;

  tokenId: number;

  txId: string;

  id: number;

  fromUser: { id: number; userName: string };
  toUser: { id: number; userName: string };

  orderId: number;

  small_image: string;

  type: NftType;

  onSaleStatus: NftStatus;

  networkId: number;

  pendingQuantity: number;

  successQuantity: number;

  action: number;

  isCreated: IsCreated = IsCreated.NO;

  standardType: StandardType;

  collections: Collection;

  async toEntity(
    userService: UserService,
    networkTokensService: NetworkTokensService,
  ): Promise<SaleNft> {
    const saleNft = new SaleNft();
    saleNft.fromUser = this.fromUser;
    saleNft.toUser = this.toUser;
    saleNft.price = this.price;
    saleNft.quantity = this.quantity;
    saleNft.action = this.action;
    const networkToken = await networkTokensService.findOne(
      this.networkTokenId,
    );
    saleNft.receiveToken = networkToken.tokenName;

    saleNft.nft = {
      id: parseInt(this.nftId.toString()),
      smallImage: this.small_image || null,
      tokenId: this.tokenId,
      type: this.type,
      onSaleStatus: this.onSaleStatus,
      standardType: this.standardType,
      collections: this.collections,
    };
    let time = 60 * 60 * 24;
    switch (this.expried) {
      case '15 days':
        time *= 15;
        break;
      case '10 days':
        time *= 10;
        break;
      case '7 days':
        time *= 7;
        break;
      default:
        time *= 3;
        break;
    }
    saleNft.expired = parseInt((new Date().getTime() / 1000).toString()) + time;
    saleNft.isCreated = this.isCreated;
    return saleNft;
  }
}
