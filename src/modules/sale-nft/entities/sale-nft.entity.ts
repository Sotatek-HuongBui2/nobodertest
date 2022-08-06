import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Nfts } from '../../nfts/entities/nfts.entity';
import { User } from '../../users/entities/user.entity';
import {
  IsCreated,
  NftStatus,
  NftType,
  NFT_MARKET_STATUS,
  StandardType,
} from '../../nfts/enums';
import { NetworkToken } from 'src/modules/network-tokens/entities/network-token.entity';
import { AuctionSession } from 'src/modules/auction-session/entities/auction-session.entity';
import { Collection } from 'src/modules/collections/entities/collections.entity';

@Entity('sale_nft')
export class SaleNft {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 0 })
  price: number;

  @Column({ default: 0 })
  quantity: number;

  @Column({ name: 'pending_quantity', default: 0 })
  pendingQuantity: number;

  @Column({ name: 'success_quantity', default: 0 })
  successQuantity: number;

  @Column({ default: 0, enum: [0, 1, 2, 3, 4, 5, 6] })
  action: number;

  @Column({ name: 'receive_token', default: 'USDT' })
  receiveToken: string;

  @Column({ default: 0 })
  status: number;

  @Column({ name: 'raw_transaction_id', default: 0 })
  rawTransactionId: number;

  @Column({ name: 'order_id', default: 0 })
  orderId: number;

  @Column({ name: 'bid_id', default: 0 })
  bidId: number;

  @Column({ name: 'tx_id', default: null })
  txId: string;

  @Column({ name: 'network_token_id', default: null })
  networkTokenId: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({
    default: parseInt((new Date().getTime() / 1000).toString()) + 86400,
  })
  expired: number;

  @Column({ default: '0x0000000000000000000000000000000000000000' })
  influencer: string;

  @Column({ name: 'influencer_fee', default: 0 })
  influencerFee: number;

  @Column({ name: 'original_price', default: null })
  originalPrice: number;

  @Column({ name: 'auction_session_id', default: null })
  auctionSessionId: number;

  @ManyToOne(() => Nfts, (nfts) => nfts.id, { cascade: true, eager: true })
  @JoinColumn({ name: 'nft_id' })
  nft: {
    id: number;
    smallImage: string;
    tokenId: number;
    type: NftType;
    onSaleStatus: NftStatus;
    standardType: StandardType;
    royalty?: number;
    collections: Collection;
    previewImage?: string;
    marketStatus?: NFT_MARKET_STATUS;
  };

  @ManyToOne(() => User, (fromUser) => fromUser.id, {
    cascade: true,
    eager: true,
  })
  @JoinColumn({ name: 'from_user_id' })
  fromUser: { id: number; userName: string };

  @ManyToOne(() => User, (toUser) => toUser.id, { cascade: true, eager: true })
  @JoinColumn({ name: 'to_user_id' })
  toUser: { id: number; userName: string };

  @ManyToOne(() => NetworkToken)
  @JoinColumn({ name: 'network_token_id' })
  networkToken: NetworkToken;

  @ManyToOne(() => AuctionSession)
  @JoinColumn({ name: 'auction_session_id' })
  auctionSession: AuctionSession;

  @ManyToOne(() => SaleNft)
  @JoinColumn({ name: 'parent_id' })
  parent: SaleNft;

  isCreated: IsCreated;
}
