import { EntityRepository, MoreThan, Repository } from 'typeorm';
import { OwnerNft } from './entities/owner-nft.entity';
import { User } from 'src/modules/users/entities/user.entity';

@EntityRepository(OwnerNft)
export class OwnerNftRepository extends Repository<OwnerNft> {
  async isOwnerByNftid(user: User, nftId: number) {
    return this.createQueryBuilder('ownerNft')
      .where({ user: user })
      .andWhere('nfts_id = :nftId', { nftId })
      .andWhere('ownerNft.sale_total > 0')
      .getOne();
  }

  async findOwnerByNftid(nftId: number) {
    return this.find({
      where:  {
        nfts: { id: nftId },
        saleTotal: MoreThan(0)
      }
    })
  }

  async findAllOwnerByNFTId(nftId: number) {
    return this.find({
      where:  {
        nfts: { id: nftId }
      }
    })
  }

  async getNFTsByOwner(user: User) {
    return this.createQueryBuilder('ownerNft')
    .where({user: user})
    .innerJoinAndSelect('ownerNft.nfts', 'nfts')
    .innerJoinAndSelect('nfts.collections', 'collections')
    .innerJoinAndSelect('collections.network', 'network')
    .getMany()
  }

}
