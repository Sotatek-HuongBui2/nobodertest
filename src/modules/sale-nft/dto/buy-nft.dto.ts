import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { SaleNft } from '../entities/sale-nft.entity';
import { IsCreated, NftStatus, NftType, StandardType } from '../../nfts/enums';
import { Collection } from '../../collections/entities/collections.entity';

export class BuyOrAcceptNft {
  id: number;

  fromUser: { id: number; userName: string };

  toUser: { id: number; userName: string };

  price: number;

  @ApiProperty()
  @IsNotEmpty()
  quantity: number;

  action: number;

  receiveToken: string;

  status: string;

  rawTransactionId: number;

  tokenId: number;

  @ApiProperty()
  @IsNotEmpty()
  saleNftId: number;

  nftId: number;

  small_image: string;

  expried: number;

  orderId: number;

  type: NftType;

  txId: string;

  onSaleStatus: NftStatus;

  isCreated: IsCreated = IsCreated.NO;

  collections: Collection;

  standardType: StandardType;

  isAcceptHasPutSale: boolean;

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
    saleNft.expired = this.expried || 86400;
    saleNft.price = Number(this.price);
    saleNft.receiveToken = this.receiveToken;
    saleNft.orderId = this.orderId;
    saleNft.isCreated = this.isCreated;
    return saleNft;
  }
}
