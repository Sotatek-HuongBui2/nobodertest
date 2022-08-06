import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Nfts } from 'src/modules/nfts/entities/nfts.entity';
import { Collection } from 'src/modules/collections/entities/collections.entity';
import { NetworkToken } from 'src/modules/network-tokens/entities/network-token.entity';

@Entity('networks')
export class Network {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'name', nullable: false })
  name: string;

  @Column({ name: 'chain_id', nullable: true, default: 0 })
  chainId: number;

  @Column({ name: 'market_contract', nullable: true })
  marketContract: string;

  @Column({ name: 'xanalia1155_general_contract', nullable: true })
  xanalia1155GeneralContract: string;

  @Column({ name: 'xanalia721_general_contract', nullable: true })
  xanalia721GeneralContract: string;

  @Column({ name: 'xanalia_dex_contract', nullable: true })
  xanaliaDexContract: string;

  @Column({ name: 'offer_dex_contract', nullable: true })
  offerDexContract: string;

  @Column({ name: 'xanalia_uri_contract', nullable: true })
  xanaliaURIContract: string;

  @Column({ name: 'xanalia_treasury_contract', nullable: true })
  xanaliaTreasury: string;

  @Column({ name: 'auction_contract', nullable: true })
  auctionContract: string;

  @Column({ name: 'moralis_transactions', nullable: true })
  moralisTransactions: string;

  @Column({ name: 'rpc', nullable: true })
  rpc: string;

  @Column({ name: 'image', nullable: true })
  image: string;

  @Column({ name: 'gas_limit', nullable: true, default: 0 })
  gasLimit: number;

  @Column({ name: 'gas_limit_collection', nullable: true, default: 0 })
  gasLimitCollection: number;

  @Column({ name: 'gas_price', nullable: true, default: 20e9 })
  gasPrice: string;

  @Column({ name: 'status', nullable: true, default: 0 })
  status: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @OneToMany(() => Collection, (collection) => collection.network)
  collections: Collection[];

  @OneToMany(() => Nfts, (nfts) => nfts.network)
  nfts: Nfts[];

  @OneToMany(() => NetworkToken, (contractToken) => contractToken.network)
  networkTokens: NetworkToken[];
}
