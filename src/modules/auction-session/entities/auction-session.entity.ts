import { Nfts } from 'src/modules/nfts/entities/nfts.entity';

import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { AuctionSessionStatus } from '../enums';
import { SaleNft } from 'src/modules/sale-nft/entities/sale-nft.entity';
import { NetworkToken } from 'src/modules/network-tokens/entities/network-token.entity';
import { User } from 'src/modules/users/entities/user.entity';

@Entity('auction_session')
export class AuctionSession {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false, name: 'nft_id' })
  nftId: number;

  @Column({ nullable: false, name: 'user_id' })
  userId: number;

  @Column({ default: 0, name: 'highest_price' })
  highestPrice: number;

  @Column({ default: null, name: 'network_token_id' })
  networkTokenId: number;

  @Column({ default: 0, name: 'start_price' })
  startPrice: number;

  @Column({ default: 0, name: 'end_price' })
  endPrice: number;

  @Column({ default: 0, name: 'step_price' })
  stepPrice: number;

  @Column({ name: 'status', default: AuctionSessionStatus.NEW })
  status: AuctionSessionStatus;

  @Column({ default: 0, name: 'session_id' })
  sessionId: number;

  @Column({ name: 'receive_token', default: 'USDT' })
  receiveToken: string;

  @Column({ default: null, name: 'start_time', nullable: true })
  startTime: Date;

  @Column({ default: null, name: 'end_time', nullable: true })
  endTime: Date;

  @Column({ default: null, name: 'tx_id' })
  txId: string;

  @Column({ default: 0, name: 'sc_auction_id' })
  scAuctionId: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.auctionSessions, { cascade: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Nfts, (nfts) => nfts.id, { cascade: true })
  @JoinColumn({ name: 'nft_id' })
  nft: Nfts;

  @OneToMany(() => SaleNft, (nftVersion) => nftVersion.auctionSession)
  saleNft: SaleNft[];

  @ManyToOne(() => NetworkToken)
  @JoinColumn({ name: 'network_token_id' })
  networkToken: NetworkToken;
}
