import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { LikeStatus } from '../enums';

@Entity('user_like_nft')
export class UserLikeNft {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id', nullable: true, default: null })
  userId: number;

  @Column({ name: 'nft_id', nullable: true, default: null })
  nftId: number;

  @Column({ nullable: true })
  status: LikeStatus;
}
