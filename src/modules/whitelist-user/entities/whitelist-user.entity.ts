import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  BaseEntity,
  ManyToOne,
} from 'typeorm';
import { Network } from 'src/modules/networks/entities/network.entity';
import { User } from 'src/modules/users/entities/user.entity';

@Entity('whitelist_user')
export class WhitelistUser extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 0 })
  status: number;

  @Column({ name: 'is_update', default: 0 })
  isUpdate: number;

  @OneToOne(() => User, { cascade: true, eager: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Network, {
    cascade: true,
    eager: true,
  })
  @JoinColumn({ name: 'network_id' })
  network: Network;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({
    name: 'updated_at',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;
}
