import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity('external_transaction')
export class ExternalTransaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'tx_hash', nullable: true, default: null })
  txHash: string;

  @Column({ nullable: true, default: null })
  address: string;

  @Column({ nullable: true, default: null })
  action: number;

  @Column({ default: 0 })
  status: number;

  @Column({ name: 'network_id', nullable: true, default: null })
  networkId: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
