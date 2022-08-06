import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExternalTransactionsController } from './exrternal-transactions.controller';
import { ExternalTransactionsRepository } from './external-transactions.repository';
import { ExternalTransactionsService } from './external-transactions.service';
import { NetworkModule } from '../networks/network.module';

@Module({
  imports: [TypeOrmModule.forFeature([ExternalTransactionsRepository]), NetworkModule],
  controllers: [ExternalTransactionsController],
  providers: [ExternalTransactionsService],
  exports: [ExternalTransactionsService],
})
export class ExternalTransactionsModule {}
