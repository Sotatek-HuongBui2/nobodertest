import { Injectable, NotFoundException } from '@nestjs/common';
import { CustomErrorMessage } from 'src/common/constants/error-message';
import { NetworkTokensRepository } from 'src/modules/network-tokens/network-token.repository';
import { NetworkTokenStatus } from './enums';

@Injectable()
export class NetworkTokensService {
  constructor(
    private readonly networkTokensRepository: NetworkTokensRepository,
  ) {}

  async getAll() {
    return this.networkTokensRepository.find({
      status: NetworkTokenStatus.ACTIVE,
    });
  }

  async findByNetwork(networkId: number) {
    return this.networkTokensRepository.find({
      networkId,
      status: NetworkTokenStatus.ACTIVE,
    });
  }

  async findOne(id: number) {
    const networkToken = await this.networkTokensRepository.findOne({
      relations: ['network'],
      where: { id, status: NetworkTokenStatus.ACTIVE },
    });
    if (!networkToken) {
      throw new NotFoundException(
        CustomErrorMessage['NETWORK_TOKEN.NOT_FOUND'],
      );
    }
    return networkToken;
  }

  async findOneByNetworkAndTokenName(networkId: number, tokenName: string) {
    const networkToken = await this.networkTokensRepository.findOne({
      relations: ['network'],
      where: { networkId, tokenName, status: NetworkTokenStatus.ACTIVE },
    });
    if (!networkToken) {
      throw new NotFoundException(
        CustomErrorMessage['NETWORK_TOKEN.NOT_FOUND'],
      );
    }
    return networkToken;
  }
}
