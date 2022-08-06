import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsNumber,
  IsPositive,
} from 'class-validator';
import { SaleNft } from '../entities/sale-nft.entity';
import { IsCreated, NftStatus, NftType, StandardType } from '../../nfts/enums';
import { IsExistInviteCode } from '../../../common/decorators/exit-referral-code.decorator';
import { SaleNftType } from '../const';
import { UserService } from 'src/modules/users/user.service';
import { Collection } from 'src/modules/collections/entities/collections.entity';

export class CreateMakeOfferDto {
  id: number;

  fromUser: { id: number; userName: string };

  toUser: { id: number; userName: string };

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  totalPrice: number; // is total price of: starting price + artis commission + platform_commision

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  quantity: number;

  pendingQuantity: number;

  successQuantity: number;

  action: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  receiveToken: string;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  networkTokenId: number;

  rawTransactionId: number;

  tokenId: number;

  txId: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  nftId: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsPositive()
  expried: number;

  @ApiProperty()
  @IsOptional()
  @IsString()
  @IsExistInviteCode()
  influencer: string;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  influencerFee: number;

  orderId: number;

  small_image: string;

  type: NftType;

  onSaleStatus: NftStatus;

  isCreated: IsCreated = IsCreated.NO;

  standardType: StandardType;

  collections: Collection;

  async toEntity(userService: UserService, price: number): Promise<SaleNft> {
    const saleNft = new SaleNft();
    saleNft.fromUser = this.fromUser;
    saleNft.toUser = this.toUser;
    saleNft.price = price;
    saleNft.quantity = this.quantity;
    saleNft.action = this.action;
    saleNft.receiveToken = this.receiveToken || null;
    if (
      saleNft.action === SaleNftType.PUT_ON_SALE &&
      this.influencer &&
      this.influencerFee
    ) {
      const influencer = await userService.findInviteCode(this.influencer);
      if (influencer) {
        saleNft.influencerFee = this.influencerFee;
        saleNft.influencer = influencer.userWallet.address;
      }
    }
    saleNft.nft = {
      id: parseInt(this.nftId.toString()),
      smallImage: this.small_image || null,
      tokenId: this.tokenId,
      type: this.type,
      onSaleStatus: this.onSaleStatus,
      standardType: this.standardType,
      collections: this.collections,
    };

    saleNft.expired = this.expried;
    saleNft.isCreated = this.isCreated;
    return saleNft;
  }
}
