import { EntityRepository, Repository } from 'typeorm';
import { NetworkToken } from 'src/modules/network-tokens/entities/network-token.entity';

@EntityRepository(NetworkToken)
export class NetworkTokensRepository extends Repository<NetworkToken> {}
