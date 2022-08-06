import { EntityRepository, Repository } from 'typeorm';
import { AuctionSession } from 'src/modules/auction-session/entities/auction-session.entity';

@EntityRepository(AuctionSession)
export class AuctionSessionRepository extends Repository<AuctionSession> {}
