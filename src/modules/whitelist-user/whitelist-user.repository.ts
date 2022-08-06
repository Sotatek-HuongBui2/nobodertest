import { EntityRepository, Repository } from 'typeorm';
import { WhitelistUser } from './entities/whitelist-user.entity';

@EntityRepository(WhitelistUser)
export class WhitelistUserRepository extends Repository<WhitelistUser> {
}
