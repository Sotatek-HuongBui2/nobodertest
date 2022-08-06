import { EntityRepository, Repository } from 'typeorm';
import { User } from './entities/user.entity';

@EntityRepository(User)
export class UserRepository extends Repository<User> {
  findByEmail(email: string): Promise<User> {
    return this.findOne({ email });
  }

  findByUserAddress(userAddress: string): Promise<User> {
    return this.createQueryBuilder('u')
      .leftJoin('u.userWallet', 'uw')
      .where('uw.address = :userAddress', { userAddress })
      .getOne();
  }
}
