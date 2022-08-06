import { Column, Entity, BaseEntity, PrimaryGeneratedColumn } from 'typeorm';
import { CollectionLaunchpadStatus } from '../enums';

@Entity({ name: 'collection_launchpad' })
export class CollectionLaunchpad extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ name: 'creator_name', nullable: true })
  creatorName: string;

  @Column({ name: 'creator_description', nullable: true })
  creatorDescription: string;

  @Column({ name: 'thumbnail_image', nullable: true })
  thumbnailImage: string;

  @Column({ name: 'icon_image', nullable: true })
  iconImage: string;

  @Column({ name: 'banner_image', nullable: true })
  bannerImage: string;

  @Column({ name: 'chain', nullable: true })
  chain: string;

  @Column({ name: 'status', default: CollectionLaunchpadStatus.VISIBLE })
  status: CollectionLaunchpadStatus;
}
