import { EntityRepository, Repository } from 'typeorm';
import { CollectionLaunchpad } from './entities/collection-launchpad.entity';

@EntityRepository(CollectionLaunchpad)
export class CollectionLaunchpadRepository extends Repository<CollectionLaunchpad> {
}
