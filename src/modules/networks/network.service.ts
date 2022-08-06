import { Injectable, NotFoundException } from '@nestjs/common';
import { CustomErrorMessage } from 'src/common/constants/error-message';
import { NetworkRepository } from './network.repository';

@Injectable()
export class NetworkService {
  constructor(private readonly networkRepository: NetworkRepository) {}

  async findOne(id: number) {
    const network = await this.networkRepository.findOneById(id);
    if (!network) {
      throw new NotFoundException(CustomErrorMessage['NETWORK.NOT_FOUND']);
    }
    return network;
  }

  async findAll() {
    return this.networkRepository.findAll();
  }
}
