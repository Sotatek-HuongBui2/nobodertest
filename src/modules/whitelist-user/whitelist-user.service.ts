import { BadRequestException, Injectable } from '@nestjs/common';
import { CustomErrorMessage } from 'src/common/constants/error-message';
import { GetListWhitelistDto } from '../admin/dto/get-list-whitelist.dto';
import { Network } from '../networks/entities/network.entity';
import { NetworkService } from '../networks/network.service';
import { SaleNftRepository } from '../sale-nft/sale-nft.repository';
import { User } from '../users/entities/user.entity';
import { WhitelistUser } from './entities/whitelist-user.entity';
import { statusWhitelistUser } from './enum';
import { WhitelistUserRepository } from './whitelist-user.repository';
import { SaleNftType } from '../sale-nft/const'
import { getPagination } from 'src/common/utility/common.utility';
@Injectable()
export class WhitelistUserService {
  constructor(
    private readonly whitelistUserRepository: WhitelistUserRepository,
    private readonly saleNftRepository: SaleNftRepository,
    private networkService: NetworkService
  ) { }

  async requestWhitelist(networkId: number, user: User) {
    let network = await this.networkService.findOne(networkId)
    if (!network) {
      throw new BadRequestException(
        CustomErrorMessage[
        'NETWORK.NOT_FOUND_ID_NOT_FOUND'
        ],
      );
    }
    let whitelistUser = await this.findOneWhitelistUser(network.id, user.id, null)
    if (whitelistUser) {
      whitelistUser.status = statusWhitelistUser.PENDING
      this.whitelistUserRepository.save(whitelistUser)
      return whitelistUser
    }
    return await this.saveNewWhitelistUser(network, user)
  }



  async saveNewWhitelistUser(network: Network, user: User) {
    let whitelistUser = new WhitelistUser()
    whitelistUser.network = network
    whitelistUser.user = user
    whitelistUser.status = statusWhitelistUser.PENDING
    return await this.whitelistUserRepository.save(whitelistUser)
  }

  async findOneWhitelistUser(networkId, userId, address) {
    let query = {}
    if (address) {
      query = {
        user: { userWallet: { address: address } }
      }
    } else {
      query = {
        user: { id: userId }
      }
    }
    let whitelistUser = await this.whitelistUserRepository.findOne({
      relations: ['user', 'network'],
      where: {
        ...query, network: { id: networkId }
      }
    })
    return whitelistUser
  }

  async getAllWhitelistUser(getListWhitelistDto: GetListWhitelistDto) {
    const { status, page, limit } = getListWhitelistDto
    const $query = this.whitelistUserRepository.createQueryBuilder('whitelist_user')
      .select([
        'whitelist_user.id as id',
        'whitelist_user.status as status',
        'user.id as userId',
        'user.email as email',
        'user.twitterSite as twitter',
        'network.id as networkId',
        'network.name as network',
        'userWallet.address as walletAddress',
        'user.userName as userName',
        'whitelist_user.isUpdate as isUpdate',
        'whitelist_user.createdAt as createdAt',
        'whitelist_user.updatedAt as updatedAt'
      ])
      .addSelect(`(SELECT count(*) from sale_nft where sale_nft.from_user_id = whitelist_user.user_id and sale_nft.action = ${SaleNftType.BUY_NFT}) as buyingAmount`)
      .leftJoin('whitelist_user.user', 'user', 'whitelist_user.user = user.id')
      .leftJoin('user.userWallet', 'userWallet')
      .leftJoin('whitelist_user.network', 'network')
    if (status) {
      $query.andWhere('whitelist_user.status = :status', { status: status })
    }
    if (page && limit) {
      $query
        .limit(limit)
        .offset(limit * (page - 1))
    }
    const [data, count] = await Promise.all([
      $query.getRawMany(),
      $query.getCount()
    ]);
    return getPagination(data, count, Math.ceil(count / limit), page)
  }
}
