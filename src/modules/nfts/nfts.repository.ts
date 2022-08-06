import { EntityRepository, Repository } from 'typeorm';
import { Nfts } from 'src/modules/nfts/entities/nfts.entity';

@EntityRepository(Nfts)
export class NftsRepository extends Repository<Nfts> {}
