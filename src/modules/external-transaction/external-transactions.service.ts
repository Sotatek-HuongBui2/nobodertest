import { BadRequestException, Injectable } from '@nestjs/common';
import { CustomErrorMessage } from 'src/common/constants/error-message';
import { NetworkService } from '../networks/network.service';
import { CreateExternalTransactionDto } from './dto/create-external-transaction.dto';
import { ExternalTransactionsRepository } from './external-transactions.repository';

@Injectable()
export class ExternalTransactionsService {
  constructor(
    private readonly externalTransactionsRepository: ExternalTransactionsRepository,
    private readonly networkService: NetworkService,
  ) {}

  async externalUserSendTx(
    createExternalTransactionDto: CreateExternalTransactionDto,
  ) {
    const [check] = await Promise.all([
      this.externalTransactionsRepository.findOne({
        txHash: createExternalTransactionDto.txHash,
      }),
      this.networkService.findOne(createExternalTransactionDto.networkId),
    ]);

    if (check) {
      throw new BadRequestException(
        CustomErrorMessage['TRANSACTION.TXHASH_EXISTED'],
      );
    }
    const dataUpdate = await createExternalTransactionDto.toEntity();
    return this.externalTransactionsRepository.save(dataUpdate);
  }
}
