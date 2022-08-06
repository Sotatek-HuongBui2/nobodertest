import { EntityRepository, In, Repository } from 'typeorm';
import { SaleNft } from 'src/modules/sale-nft/entities/sale-nft.entity';
import { SaleNftStatus } from './const';

@EntityRepository(SaleNft)
export class SaleNftRepository extends Repository<SaleNft> {
  findSaleNftByNftId(
    nftId: number,
    action: number,
    userId: number = null,
    status: Array<number> = [SaleNftStatus.NEW, SaleNftStatus.SUCCESS],
    receiveToken = null,
  ) {
    let where;
    if (userId) {
      where = {
        nft: { id: nftId },
        fromUser: { id: userId },
        action: action,
        status: In(status),
      };
    } else {
      where = {
        nft: { id: nftId },
        action: action,
        status: In(status),
      };
    }
    if (receiveToken) {
      where.receiveToken = receiveToken;
      return this.find({
        where,
        order: {
          price: 'ASC',
        },
      });
    }
    return this.find({
      where,
      order: {
        id: 'DESC',
      },
    });
  }

  findOneSaleNft(saleNftId: number, action: number, userId: number = null) {
    if (userId) {
      return this.find({
        id: saleNftId,
        fromUser: { id: userId },
        action: action,
      });
    } else {
      return this.find({
        id: saleNftId,
        action: action,
        status: SaleNftStatus.SUCCESS,
      });
    }
  }
}
