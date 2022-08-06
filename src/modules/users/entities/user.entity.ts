import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  OneToMany,
  JoinTable,
  BaseEntity,
} from 'typeorm';
import { OwnerNft } from 'src/modules/owner-nft/entities/owner-nft.entity';
import { UserWallet } from 'src/modules/user-wallet/entities/user-wallet.entity';
import { Nfts } from '../../nfts/entities/nfts.entity';
import { AuctionSession } from 'src/modules/auction-session/entities/auction-session.entity';
import { Collection } from 'src/modules/collections/entities/collections.entity';
import { Exclude } from 'class-transformer';

@Entity('users')
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_name' })
  userName: string;

  @Exclude()
  @Column()
  password: string;

  @Column()
  email: string;

  @Column()
  role: number;

  @Column({ name: 'email_verification_token' })
  emailVerificationToken: string;

  @Column({ name: 'email_verified' })
  emailVerified: number;

  @Column({ name: 'twitter_verified' })
  twitterVerified: number;

  @Column({ nullable: true })
  avatar: string;

  @Column({ nullable: true })
  banner: string;

  @Column({ nullable: true })
  description: string;

  @Column({ name: 'first_name', nullable: true })
  firstName: string;

  @Column({ name: 'last_name', nullable: true })
  lastName: string;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  about: string;

  @Column({ nullable: true })
  website: string;

  @Column({ name: 'facebook_site', nullable: true })
  facebookSite: string;

  @Column({ name: 'instagram_site', nullable: true })
  instagramSite: string;

  @Column({ name: 'twitter_site', nullable: true })
  twitterSite: string;

  @Column({ name: 'youtube_site', nullable: true })
  youtubeSite: string;

  @Column({ name: 'discord_site', nullable: true })
  discordSite: string;

  @Column({ name: 'zoom_mail', nullable: true })
  zoomMail: string;

  @Column({ name: 'invite_code', nullable: true })
  inviteCode: string;

  @Column()
  following: number;

  @Column()
  followers: number;

  @Column({ name: 'user_nft_role' })
  userNftRole: number;

  @OneToOne(() => UserWallet, { cascade: true, eager: true })
  @JoinColumn({ name: 'user_wallet_id' })
  userWallet: UserWallet;

  @Column({ default: 0, name: 'is_non_crypto' })
  isNonCrypto: number;

  @Column({ default: 0 })
  status: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({
    name: 'updated_at',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  @Exclude()
  @Column({ name: 'forgot_password', nullable: true })
  forgotPassword: string;

  @Column({ nullable: true, name: 'last_login' })
  lastLogin: Date;

  @OneToMany(() => Nfts, (nfts) => nfts.user)
  nfts: Nfts[];

  @OneToMany(() => OwnerNft, (nfts) => nfts.user)
  ownerNfts: OwnerNft[];

  @OneToMany(() => AuctionSession, (auctionSession) => auctionSession.user)
  auctionSessions: AuctionSession[];

  @OneToMany(() => Collection, (collections) => collections.user)
  @JoinTable()
  collections: Collection[];
}
