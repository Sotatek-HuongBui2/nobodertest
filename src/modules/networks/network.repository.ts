import { EntityRepository, Repository } from 'typeorm';
import { Network } from './entities/network.entity';
import { NetworkStatus } from './enums';

@EntityRepository(Network)
export class NetworkRepository extends Repository<Network> {
  async findOneById(id: number) {
    return this.createQueryBuilder('networks')
      .where('networks.id = :networkId AND networks.status = :status', {
        status: NetworkStatus.ACTIVE,
        networkId: id,
      })
      .leftJoinAndSelect('networks.networkTokens', 'networkTokens')
      .getOne();
  }

  findAll() {
    return this.createQueryBuilder('networks')
      .where('networks.status = :status', {
        status: NetworkStatus.ACTIVE,
      })
      .leftJoinAndSelect('networks.networkTokens', 'networkTokens')
      .getMany();
  }
}
