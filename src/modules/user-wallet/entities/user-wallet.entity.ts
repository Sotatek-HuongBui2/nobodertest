import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Exclude } from 'class-transformer';

@Entity('user-wallet')
export class UserWallet {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('longtext', { name: 'address', nullable: true, default: null })
  address: string;

  @Column({ default: 0 })
  type: number;

  @Column({ default: 0 })
  nonce: number;

  @Exclude({ toPlainOnly: true })
  @Column('longtext', {
    name: 'private_key_encrypted_value',
    nullable: true,
    default: null,
    select: false,
  })
  privateKeyEncryptedValue: string;

  @Exclude({ toPlainOnly: true })
  @Column('longtext', {
    name: 'private_key_encryption_key',
    nullable: true,
    default: null,
    select: false,
  })
  privateKeyEncryptionKey: string;

  @Exclude({ toPlainOnly: true })
  @Column('longtext', {
    name: 'private_key_encryption_algorithm',
    nullable: true,
    default: null,
    select: false,
  })
  privateKeyEncryptionAlgorithm: string;
}
