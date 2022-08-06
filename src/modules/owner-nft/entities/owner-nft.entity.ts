import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Nfts } from '../../nfts/entities/nfts.entity';

@Entity('owner_nft')
@Unique(['user', 'nfts'])
export class OwnerNft extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.ownerNfts, {
    cascade: true,
    eager: true,
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Nfts, (nfts) => nfts.ownerNfts, {
    cascade: true,
    eager: true,
    nullable: false,
  })
  @JoinColumn({ name: 'nfts_id' })
  nfts: Nfts;

  @Column({ nullable: true, name: 'sale_total', default: 0 })
  saleTotal: number;

  @Column({ nullable: true, name: 'farm_total', default: 0 })
  farmTotal: number;
}
