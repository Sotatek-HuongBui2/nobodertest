import { EntityRepository, Repository } from 'typeorm';
import { Collection } from './entities/collections.entity';

@EntityRepository(Collection)
export class CollectionsRepository extends Repository<Collection> {

  async getListCollectionByUserId(userId: number) {
    return (
      this.createQueryBuilder('collection')
        .where('user_id = :userId', { userId: `${userId}` })
        .getMany()
    );
  }

  async getAllCollection() {
    return this.createQueryBuilder('collection').select([
      "collection.contractAddress"
    ]).where("collection.status = 1").getMany()
  }
}
