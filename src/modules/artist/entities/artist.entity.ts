import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  BaseEntity,
} from 'typeorm';
import { User } from 'src/modules/users/entities/user.entity';
import { StatusArtists } from '../enum';

@Entity('artists')
export class Artist extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: StatusArtists.DEFAULT })
  status: StatusArtists;

  @OneToOne(() => User, { cascade: true, eager: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'first_answer', nullable: true })
  firstAnswer: string;

  @Column({ name: 'second_answer', nullable: true })
  secondAnswer: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({
    name: 'updated_at',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;
}
