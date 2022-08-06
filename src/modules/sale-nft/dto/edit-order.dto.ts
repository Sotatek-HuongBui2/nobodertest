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

export class EditOrderDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  price: number;

  quantity: number;

  networkTokenId: number;

  nftId: number;

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

  async toEntity(): Promise<SaleNft> {
    const saleNft = new SaleNft();
    saleNft.fromUser = this.fromUser;
    saleNft.toUser = this.toUser;
    saleNft.quantity = this.quantity;
    saleNft.action = this.action;
    saleNft.nft = {
      id: this.nftId,
      smallImage: this.small_image,
      tokenId: this.tokenId,
      type: this.type,
      onSaleStatus: this.onSaleStatus,
      standardType: this.standardType,
      collections: this.collections,
    };
    saleNft.price = Number(this.price);
    saleNft.receiveToken = this.receiveToken;
    saleNft.orderId = this.orderId;
    saleNft.isCreated = this.isCreated;
    return saleNft;
  }
}
