import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  JoinColumn,
  BaseEntity,
} from 'typeorm';
import { CollectionStatus, collectionType } from '../enums';
import { Nfts } from 'src/modules/nfts/entities/nfts.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { Network } from '../../networks/entities/network.entity';

@Entity({ name: 'collections' })
export class Collection extends BaseEntity{
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  symbol: string;

  @Column({ default: collectionType.xanalia1155Artist })
  type: collectionType;

  @Column({ name: 'banner_image', nullable: true })
  bannerImage: string;

  @Column({ name: 'icon_image', nullable: true })
  iconImage: string;

  @Column({ name: 'contract_address', nullable: true })
  contractAddress: string;

  @Column({ nullable: true, default: CollectionStatus.PENDING })
  status: CollectionStatus;

  @Column('longtext', { name: 'hash_transaction', nullable: true })
  hashTransaction: string;

  @Column({ name: 'user_id', nullable: true, default: null })
  userId: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @CreateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Network, (network) => network.collections, {
    cascade: true,
    eager: true,
  })
  @JoinColumn({ name: 'network_id' })
  network: Network;

  @Column({ name: 'network_id', nullable: true, default: null })
  networkId: number;

  @ManyToOne(() => User, (user) => user.nfts)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => Nfts, (nfts) => nfts.collections)
  nfts: Nfts[];

  @Column({ name: 'is_blindbox', default: 0 })
  isBlindbox: number;

  @Column({ name: 'is_hot', default: 0 })
  isHot: number;
}
