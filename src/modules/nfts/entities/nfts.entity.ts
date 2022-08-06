import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AuctionSession } from 'src/modules/auction-session/entities/auction-session.entity';
import { Network } from 'src/modules/networks/entities/network.entity';
import { SaleNft } from 'src/modules/sale-nft/entities/sale-nft.entity';
import { OwnerNft } from '../../owner-nft/entities/owner-nft.entity';
//import { Category } from 'src/modules/categories/entities/category.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { Collection } from 'src/modules/collections/entities/collections.entity';
import {
  NftStatus,
  NftType,
  StandardType,
  NftFeature,
  Market,
  NFT_CATEGORIES,
  NFT_MARKET_STATUS,
} from '../enums';

@Entity()
export class Nfts extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true, default: 1, name: 'is_draft' })
  isDraft: number;

  @Column('longtext', { nullable: true })
  description: string;

  @Column({ name: 'unlockable_content', nullable: true })
  unlockableContent: string;

  @Column({ nullable: true, default: 0 })
  royalty: number;

  @Column({ nullable: true, name: 'no_copy', default: 0 })
  noCopy: number;

  @Column({ nullable: true, name: 'quantity', default: 0 })
  quantity: number;

  @Column({ nullable: true, name: 'price', default: 0 })
  price: number;

  @Column({ nullable: true, name: 'origin_image' })
  originImage: string;

  @Column({ nullable: true, name: 'small_image' })
  smallImage: string;

  @Column({ nullable: true, name: 'large_image' })
  largeImage: string;

  @Column({ nullable: true, name: 'ipfs_json' })
  ipfsJson: string;

  @Column({ nullable: true, default: Market.NO_MARKET })
  market: Market;

  @Column('longtext', { name: 'raw_transaction', nullable: true })
  rawTransaction: string;

  @Column('longtext', { name: 'hash_transaction', nullable: true })
  hashTransaction: string;

  @Column('longtext', { name: 'token_id', nullable: true })
  tokenId: string;

  @Column({ name: 'pumpkin', nullable: true, default: 0 })
  pumpkin: number;

  @Column({ name: 'platform_commission', nullable: true, default: 0 })
  platformCommission: number;

  @Column({
    nullable: false,
    default: NftStatus.PENDING,
  })
  status: NftStatus;

  @Column({
    nullable: false,
    default: NFT_MARKET_STATUS.NOT_ON_SALE,
    name: 'market_status',
  })
  marketStatus: NFT_MARKET_STATUS;

  @Column({
    name: 'on_farm_status',
    nullable: false,
    default: NftStatus.PENDING,
  })
  onFarmStatus: NftStatus;

  @Column({
    name: 'on_sale_status',
    nullable: false,
    default: NftStatus.PENDING,
  })
  onSaleStatus: NftStatus;

  @Column({
    nullable: false,
    name: 'type',
    default: NftType.NONE,
  })
  type: NftType;

  @Column({
    nullable: false,
    name: 'standard_type',
    comment: '0 is xanalia1155, 1 is erc721',
    default: StandardType.ERC_721,
  })
  standardType: StandardType;

  @Column({
    nullable: true,
    name: 'file_extension',
  })
  fileExtension: string;

  @Column({
    nullable: true,
    name: 'preview_image',
  })
  previewImage: string;

  @Column({
    nullable: true,
    name: 'full_image',
  })
  fullImage: string;

  @Column({
    name: 'is_feature',
    nullable: false,
    default: NftFeature.NO,
  })
  isFeature: NftFeature;

  @Column({
    nullable: true,
    name: 'collections_id',
  })
  collectionsId: number;

  @Column({ name: 'network_id', nullable: true, default: 1 })
  networkId: number;

  @Column({ name: 'receive_token', default: 'USDT' })
  receiveToken: string;

  @Column({ name: 'is_auction' })
  isAuction: number;

  @Column({ name: 'auction_receive_token' })
  auctionReceiveToken: string;

  @Column({ name: 'min_start_price', default: 0 })
  minStartPrice: number;

  @Column({ name: 'is_migrated' })
  isMigrated: number;

  @Column({
    name: 'updated_at',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @OneToMany(() => OwnerNft, (ownerNfts) => ownerNfts.nfts)
  ownerNfts: OwnerNft[];

  @OneToMany(() => SaleNft, (sn) => sn.nft)
  saleNft: SaleNft[];

  @ManyToOne(() => Network, (network) => network.nfts, {
    cascade: true,
    eager: true,
  })
  @JoinColumn({ name: 'network_id' })
  network: Network;

  @OneToMany(() => AuctionSession, (auctionSession) => auctionSession.nft)
  auctionSession: AuctionSession[];

  @ManyToOne(() => Collection, (collections) => collections.nfts, {
    cascade: true,
    eager: true,
  })
  @JoinColumn({ name: 'collections_id' })
  collections: Collection;

  // @ManyToMany(() => Category, (category) => category.nfts)
  // category: Category[];
  @Column({ default: NFT_CATEGORIES.ART })
  category: number;

  @ManyToOne(() => User, (user) => user.nfts, { cascade: true, eager: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  // @OneToMany(() => UserNftsCollectible, (unc) => unc.nfts)
  // collectibles: UserNftsCollectible[];

  @Column({ name: 'launchpad_id', default: null })
  launchpadId: number;
}
