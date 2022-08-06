import { EntityRepository, Repository } from 'typeorm';
import { ExternalTransaction } from './entities/external-transaction.entity';

@EntityRepository(ExternalTransaction)
export class ExternalTransactionsRepository extends Repository<ExternalTransaction> {}
