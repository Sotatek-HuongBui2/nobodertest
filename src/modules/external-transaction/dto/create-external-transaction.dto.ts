import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';
import { ExternalTransaction } from 'src/modules/external-transaction/entities/external-transaction.entity';

export class CreateExternalTransactionDto {
  id: number;

  @IsNotEmpty()
  @ApiProperty()
  txHash: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  action: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  networkId: number;

  address: string;

  async toEntity(): Promise<ExternalTransaction> {
    const transaction = new ExternalTransaction();
    transaction.txHash = this.txHash;
    transaction.action = this.action;
    transaction.address = this.address;
    transaction.networkId = this.networkId;
    return transaction;
  }
}
