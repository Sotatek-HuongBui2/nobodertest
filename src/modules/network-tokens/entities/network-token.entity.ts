import { Network } from 'src/modules/networks/entities/network.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('network_tokens')
export class NetworkToken {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'token_name', nullable: true })
  tokenName: string;

  @Column({ name: 'decimal', nullable: true, default: 18 })
  decimal: number;

  @Column({ name: 'network_id', nullable: true })
  networkId: number;

  @Column({ name: 'contract_address', nullable: true })
  contractAddress: string;

  @Column({ name: 'status', nullable: true, default: 0 })
  status: number;

  @Column({ name: 'is_native_token', nullable: true, default: 0 })
  isNativeToken: number;

  @Column({ name: 'currency', nullable: true })
  currency: string;

  @Column({ name: 'icon', nullable: true })
  icon: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Network, (contract) => contract.networkTokens, {
    cascade: true,
    eager: true,
  })
  @JoinColumn({ name: 'network_id' })
  network: Network;
}
