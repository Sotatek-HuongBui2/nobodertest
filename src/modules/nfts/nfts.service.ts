import { Collection } from '../collections/entities/collections.entity';
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  forwardRef,
  Inject,
  BadRequestException,
} from '@nestjs/common';
import { CustomErrorMessage } from 'src/common/constants/error-message';
import { CategoriesService } from '../categories/categories.service';
import { CollectionsService } from '../collections/collections.service';
import { SaleNftService } from '../sale-nft/sale-nft.service';
import { collectionType } from '../collections/enums';
import { NetworkTokensService } from '../network-tokens/network-tokens.service';
import { NetworkService } from '../networks/network.service';
import { User } from '../users/entities/user.entity';
import { CreateNftDto } from './dto/create-nft.dto';
import { UpdateNftDto } from './dto/update-nft.dto';
import { Nfts } from './entities/nfts.entity';
import {
  FILTER_NFT_CATEGORY,
  FILTER_NFT_MARKET,
  NftStatus,
  NftType,
  NFT_CATEGORIES,
  NFT_MARKET_STATUS,
} from './enums';
import { NftsRepository } from './nfts.repository';
import { BlockchainsService } from '../blockchains/blockchains.service';
import SOCKET_EVENT, {
  createSocketData,
  sendToSocket,
} from '../../common/utility/socket';
import { AuctionSessionService } from '../auction-session/auction-session.service';
import { AuctionSessionStatus } from '../auction-session/enums';
import { MarketBlockchainService } from '../blockchains/market-blockchain.service';
import { UserRepository } from '../users/user.repository';
import { GetNftDetailDto } from './dto/get-nft-detail.dto';
import { OwnerNftService } from '../owner-nft/owner-nft.service';
import { OwnerNftRepository } from '../owner-nft/owner-nft.repository';
import { SaleNftStatus, SaleNftType } from '../sale-nft/const';
import { CollectionsRepository } from '../collections/collections.repository';
import { NetworkRepository } from '../networks/network.repository';
import { SaleNftRepository } from '../sale-nft/sale-nft.repository';
import { GetListNftsRankingDto } from './dto/get-list-nfts-ranking.dto';
import { createClient } from 'redis';
import { NFTKey, CACHE_TIME, LIMIT_QUERY_MORALIS } from './constants';
import { UserLikeNftDto } from '../users/dto/user-like-nft.dto';
import { UserLikeNft } from '../user-like-nft/entities/user-like-user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { getConnection, getManager, In, Repository } from 'typeorm';
import _ = require('lodash');
import { GetListNftsSliderDto } from './dto/get-list-nft-slider-dto';
import { GetListNftsDiscoverDto } from './dto/get-list-nft-discover-dto';
import moment from 'moment';
import { CategoryNftUser } from '../users/enums';
import { GetNftByUserAddressDto } from './dto/get-nfts-by-user-address.dto';
import { RateCoinService } from '../rateCoins/rate-coin.service';
import { LikeStatus } from '../user-like-nft/enums';
import { RedisService } from '../redis/redis.service';
import Moralis from 'moralis/node';
import { format } from 'path';
import { compareAddress } from 'src/common/utility/common.utility';
import { OwnerNft } from '../owner-nft/entities/owner-nft.entity';
import { UserService } from '../users/user.service';
const Web3 = require('web3');
import COLLECTION_ABI from '../blockchains/abi/collection_abi.json';

Moralis.start({
  serverUrl: process.env.MORALIS_SERVER_URL,
  appId: process.env.MORALIS_APP_ID,
});

@Injectable()
export class NftsService {
  constructor(
    private readonly nftsRepository: NftsRepository,
    private readonly categoryService: CategoriesService,
    @Inject(forwardRef(() => CollectionsService))
    private collectionsService: CollectionsService,
    private readonly networkService: NetworkService,
    private readonly networkTokenService: NetworkTokensService,
    private readonly blockchainsService: BlockchainsService,
    private readonly auctionSessionService: AuctionSessionService,
    private readonly marketBlockchainService: MarketBlockchainService,
    private readonly userRepository: UserRepository,
    private readonly collectionsRepository: CollectionsRepository,
    private readonly ownerNftRepository: OwnerNftRepository,
    private readonly networkRepository: NetworkRepository,
    private readonly saleNftRepository: SaleNftRepository,
    private readonly rateCoinService: RateCoinService,
    @InjectRepository(UserLikeNft)
    private userLikeNftRepository: Repository<UserLikeNft>,

    @Inject(forwardRef(() => SaleNftService))
    private readonly saleNftService: SaleNftService,

    // redis service
    private readonly redisService: RedisService,
    // owner-nft service
    private readonly ownerNftService: OwnerNftService,
    // user service
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
  ) {}

  async create(user: User, createNft: CreateNftDto) {
    let savedNft = await this.nftsRepository.save(
      await createNft.toEntity(
        this.categoryService,
        this.collectionsService,
        this.networkService,
        this.networkTokenService,
      ),
    );
    if (!savedNft) {
      throw new InternalServerErrorException(
        CustomErrorMessage['NFT.FAILED_TO_SAVE_TO_DATABASE'],
      );
    }

    if (createNft.type === NftType.NONE || createNft.type === NftType.SALE) {
      return { savedNft };
    } else if (createNft.type === NftType.AUCTION) {
      const networkToken = savedNft.network.networkTokens.find(
        (networkToken) => networkToken.tokenName === createNft.receiveToken,
      );
      const savedAuction =
        await this.auctionSessionService.newAuctionWithMintNft(
          user,
          {
            nftId: savedNft.id,
            startPrice: createNft.startPrice,
            startTime: createNft.startTime,
            endTime: createNft.endTime,
            receiveToken: createNft.receiveToken,
          },
          networkToken,
        );

      return {
        savedAuction,
        savedNft,
      };
    }
  }

  async findAllNfts(collection: Collection) {
    return await this.nftsRepository.find({
      relations: ['network'],
    });
  }

  async update(id: number, updateNftDto: UpdateNftDto) {
    const nfts = await this.nftsRepository.findOne({
      relations: ['network', 'collections', 'collections.network', 'user'],
      where: { id },
    });
    if (!nfts) {
      throw new NotFoundException(CustomErrorMessage['NFT.NOT_FOUND']);
    }
    return this.nftsRepository.update(id, updateNftDto.toUpdateEntity());
  }

  async findById(id: number) {
    const nft = await this.nftsRepository.findOne(id);
    if (!nft) throw new NotFoundException(CustomErrorMessage['NFT.NOT_FOUND']);
    return nft;
  }

  async createNfts(nft: Nfts, user: User) {
    if (
      nft.collections.type == collectionType.xanalia721 ||
      nft.collections.type == collectionType.xanalia721Artist ||
      nft.collections.type == collectionType.default
    ) {
      let nftUpdated;
      let approveAllData = null;

      if (nft.type === NftType.NONE) {
        nftUpdated = await this.blockchainsService.createXanalia721(
          nft,
          user.userWallet,
          user.userWallet.type,
        );
      } else if (nft.type === NftType.SALE) {
        approveAllData = await this.getApproveForAllData(
          user.userWallet.address,
          user.userWallet.type,
          nft.collections,
          nft.network,
        );
        const networkToken =
          await this.networkTokenService.findOneByNetworkAndTokenName(
            nft.networkId,
            nft.receiveToken,
          );
        nftUpdated = await this.blockchainsService.createXanalia721AndPutOnSale(
          nft,
          user.userWallet,
          networkToken,
        );
      } else if (nft.type === NftType.AUCTION) {
        const [auctionSession, network, networkToken] = await Promise.all([
          this.auctionSessionService.findOneWithNftId(nft.id, [
            AuctionSessionStatus.MINT_WITH_NFT,
          ]),
          this.networkService.findOne(nft.networkId),
          this.networkTokenService.findOneByNetworkAndTokenName(
            nft.networkId,
            nft.receiveToken,
          ),
        ]);

        if (!networkToken) {
          throw new BadRequestException(
            CustomErrorMessage['NETWORK_TOKEN.NOT_FOUND'],
          );
        }

        approveAllData = await this.getApproveForAllData(
          user.userWallet.address,
          user.userWallet.type,
          nft.collections,
          network,
        );

        nftUpdated =
          await this.blockchainsService.createXanalia721AndPutAuction(
            nft,
            user.userWallet,
            user.userWallet.type,
            networkToken,
            auctionSession,
          );
      } else {
        throw new BadRequestException(CustomErrorMessage['NFT.NOT_SUPPORT']);
      }

      if (user.userWallet.type > 0) {
        await sendToSocket(
          {
            dataReturn: nftUpdated,
            address: user.userWallet.address,
            nonce: user.userWallet.nonce,
            approveAllData,
            nftId: nft.id,
            nftType: nft.type,
            type: nft.collections.type,
          },
          SOCKET_EVENT.SEND_DATA_SIGN_CREATE_NFT,
        );
        return {
          dataReturn: nftUpdated,
          nonce: user.userWallet.nonce,
          approveAllData,
        };
      }
    } else {
      throw new NotFoundException(CustomErrorMessage['NFT.NOT_SUPPORT']);
    }
  }

  async nftDetails(getNftDetailDto: GetNftDetailDto) {
    try {
      const { networkName, collectionAddress, nftId, nftTokenId } =
        getNftDetailDto;
      let nftQuery = this.nftsRepository
        .createQueryBuilder('nfts')
        .select([
          'nfts.id as nftId',
          'nfts.name as name',
          'nfts.category as category',
          'nfts.standardType as standardType',
          'nfts.description as description',
          'nfts.marketStatus as marketNftStatus',
          'nfts.isMigrated as isMigrated',
          'CASE WHEN market_status = 1 THEN(SELECT sn.price FROM sale_nft sn WHERE sn.nft_id = nfts.id AND sn.action = 0 AND sn.status = 1 LIMIT 1) WHEN market_status in (2, 4) THEN( SELECT aus.highest_price FROM auction_session aus WHERE aus.nft_id = nfts.id  AND aus.status in (0, 1, 2, 3)limit 1 ) ELSE "" END as price',
          'nfts.receiveToken as tokenPrice',
          `CASE WHEN nfts.category IN (${NFT_CATEGORIES.VIDEO}, ${NFT_CATEGORIES.AUDIO}) THEN nfts.previewImage ELSE nfts.smallImage END as thumbnailUrl `,
          'nfts.largeImage as mediaUrl',
          'nfts.tokenId as tokenId',
          'nfts.launchpadId as launchpadId',
          'nfts.royalty as royalty',
        ])
        .addSelect(
          '(SELECT COUNT(*) FROM user_like_nft uln WHERE uln.nft_id = nfts.id AND uln.status = 1) as totalLike',
        )
        .leftJoin('networks', 'networks', 'networks.id = nfts.network')
        .leftJoin(
          'collections',
          'collections',
          'collections.id = nfts.collections',
        )
        .leftJoin('users', 'user', 'user.id = nfts.user')
        .where('nfts.isDraft = 0');

      const networkNft = this.networkRepository
        .createQueryBuilder('networks')
        .select([
          'networks.name as networkName',
          'networks.id as networkId',
          'nt.icon as tokenIcon',
        ])
        .leftJoin('nfts', 'nfts', 'networks.id = nfts.network')
        .leftJoin('networks.networkTokens', 'nt');

      const creatorNft = this.nftsRepository
        .createQueryBuilder('nfts')
        .select([
          'users.id as userId',
          'users.description as description',
          'users.avatar as avatar',
          'users.userName as name',
          'users.facebookSite as facebookLink',
          'users.instagramSite as instagramLink',
          'users.twitterSite as twitterLink',
          'users.role as role',
          '(select uw.address from `user-wallet` uw where uw.id = users.userWallet) as address',
        ])
        .leftJoin('users', 'users', 'users.id = nfts.user')
        .leftJoin('networks', 'networks', 'networks.id = nfts.network')
        .leftJoin(
          'collections',
          'collections',
          'collections.id = nfts.collections',
        );

      const collectionNft = this.collectionsRepository
        .createQueryBuilder('collections')
        .select([
          'collections.name as name',
          'collections.contractAddress as address',
          'collections.iconImage as avatar',
        ])
        .leftJoin('nfts', 'nfts', 'collections.id = nfts.collections');

      if (nftId) {
        nftQuery.andWhere('nfts.id = :nftId', { nftId });
      } else {
        nftQuery
          .andWhere('nfts.tokenId = :nftTokenId', { nftTokenId })
          .andWhere('collections.contractAddress = :collectionAddress', {
            collectionAddress,
          })
          .andWhere('networks.name = :networkName', { networkName });
      }
      const nftDetail = await nftQuery.getRawOne();

      creatorNft.andWhere('nfts.id = :nftId', { nftId: nftDetail.nftId });
      collectionNft.andWhere('nfts.id = :nftId', { nftId: nftDetail.nftId });
      networkNft.andWhere('nfts.id = :nftId', { nftId: nftDetail.nftId });

      const ownerQuery = this.ownerNftRepository
        .createQueryBuilder('ownerNft')
        .select([
          'ownerNft.user as id',
          'users.userName as name',
          'users.avatar as avatar',
          'users.role as role',
          '(select uw.address from `user-wallet` uw where uw.id = users.userWallet) as address',
        ])
        .leftJoin('users', 'users', 'ownerNft.user = users.id')
        .where('ownerNft.nfts = :nftId', { nftId: nftDetail.nftId })
        .andWhere('ownerNft.saleTotal > 0');

      const [network, creator, collection, owner] = await Promise.all([
        networkNft.getRawOne(),
        creatorNft.getRawOne(),
        collectionNft.getRawOne(),
        ownerQuery.getRawOne(),
      ]);
      if (!nftDetail) {
        return {};
      }
      nftDetail['network'] = network;
      nftDetail['creator'] = creator;
      nftDetail['collection'] = collection;
      nftDetail['owner'] = owner ? owner : creator;
      nftDetail['saleData'] = {
        fixPrice: null,
        auction: null,
      };
      if (nftDetail.marketNftStatus == NFT_MARKET_STATUS.ON_FIX_PRICE) {
        const putOnSales = await this.saleNftRepository
          .createQueryBuilder('sn')
          .select([
            'sn.id, sn.price, sn.receiveToken as tokenPrice, sn.action, sn.status, sn.originalPrice as originalPrice, sn.networkTokenId as networkTokenId, nk.icon as tokenIcon',
          ])
          .leftJoin('network_tokens', 'nk', 'sn.networkTokenId = nk.id')
          .where('sn.nft = :id', { id: nftDetail.nftId })
          .andWhere('sn.status = :status', { status: SaleNftStatus.SUCCESS })
          .andWhere('sn.action = :action', { action: SaleNftType.PUT_ON_SALE })
          .andWhere('sn.fromUser = :fromUser', { fromUser: owner.id })
          .orderBy('sn.id', 'DESC')
          .getRawOne();
        nftDetail['saleData'].fixPrice = putOnSales;
      }

      let isLike = 0;
      if (getNftDetailDto.userId) {
        const likeInfo = await this.userLikeNftRepository.findOne({
          where: { userId: getNftDetailDto.userId, nftId: nftDetail.nftId },
        });
        isLike = likeInfo?.status ?? 0;
      }
      nftDetail['isLike'] = isLike;

      if (
        [
          NFT_MARKET_STATUS.IMCOMMING_AUCTION,
          NFT_MARKET_STATUS.ON_AUCTION,
          NFT_MARKET_STATUS.END_AUCTION,
          NFT_MARKET_STATUS.CANCEL_AUCTION,
        ].includes(nftDetail.marketNftStatus)
      ) {
        let actionSaleNft;
        let status;
        switch (nftDetail.marketNftStatus) {
          case NFT_MARKET_STATUS.CANCEL_AUCTION:
            actionSaleNft = SaleNftType.CANCEL_AUCTION;
            status = SaleNftStatus.SUCCESS;
            break;
          case NFT_MARKET_STATUS.END_AUCTION:
            actionSaleNft = SaleNftType.PUT_AUCTION;
            status = SaleNftStatus.NOT_COUNT;
            break;
          default:
            actionSaleNft = SaleNftType.PUT_AUCTION;
            status = SaleNftStatus.SUCCESS;
            break;
        }

        const auction = await this.saleNftRepository
          .createQueryBuilder('sn')
          .select([
            'acs.id as auctionId, acs.receiveToken as tokenPrice, acs.status, acs.networkTokenId as networkTokenId, nk.icon as tokenIcon' +
              ', acs.highestPrice as highestPrice, acs.startPrice as startPrice, acs.endPrice as endPrice, acs.stepPrice as stepPrice' +
              ', acs.startTime as startTime, acs.endTime as endTime',
          ])
          .leftJoin('auction_session', 'acs', 'sn.auctionSessionId = acs.id')
          .leftJoin('network_tokens', 'nk', 'acs.networkTokenId = nk.id')
          .where('sn.nft = :id', { id: nftDetail.nftId })
          .andWhere('sn.status = :status', { status: status })
          .andWhere(`sn.action = ${actionSaleNft}`)
          .andWhere(`sn.fromUser = ${owner.id}`)
          .orderBy('sn.id', 'DESC')
          .getRawOne();
        const highestBidder = await this.auctionSessionService.getHighestBidder(
          auction.auctionId,
        );
        auction.highestBidder = highestBidder?.uw_address
          ? highestBidder.uw_address
          : '';
        nftDetail['saleData'].auction = auction;
      }
      return nftDetail;
    } catch (e) {
      console.log(e);
    }
  }

  async nftsById(nftId: number) {
    const nft = await this.nftsRepository.findOne(nftId);
    let totalLike = await this.nftsRepository
      .createQueryBuilder('nfts')
      .select(
        '(SELECT COUNT(*) FROM user_like_nft uln WHERE uln.nft_id = nfts.id AND uln.status = 1) as totalLike',
      )
      .where('nfts.id = :id', { id: nftId })
      .getRawOne();
    if (!nft) {
      throw new NotFoundException(CustomErrorMessage['NFT.NOT_FOUND']);
    }
    nft['totalLike'] = totalLike.totalLike;
    return { data: nft };
  }

  async getApproveForAllData(
    userWalletAddress: string,
    userWalletType,
    collection,
    network,
    contractAddress: string = network.xanaliaDexContract,
  ) {
    if (
      !(await this.marketBlockchainService.isApprovedForAll(
        userWalletAddress,
        collection,
        network,
        contractAddress,
      ))
    ) {
      return await this.marketBlockchainService.setApprovalForAll(
        userWalletAddress,
        collection,
        network,
        userWalletType,
        contractAddress,
      );
    }
    return null;
  }

  async getListNfts(
    user: User,
    // isDraft: number,
    collection: number,
    network: number,
    ownerNft: string,
    pageIndex: number,
    pageSize: number,
  ) {
    try {
      const page = pageIndex || 1;
      const size = pageSize || 10;
      const exchangeRates =
        await this.rateCoinService.getExchangeRateByNetworkTokens('ETH');

      let selectByReceiveToken = '';
      exchangeRates.forEach((exchangeRate) => {
        selectByReceiveToken += ` WHEN '${exchangeRate.from_coin}' THEN sn.price * ${exchangeRate.exchange_rate}`;
      });
      selectByReceiveToken = `(CASE sn.receiveToken ${selectByReceiveToken} else sn.price END)`;

      const query = this.nftsRepository
        .createQueryBuilder('nfts')
        .select([
          'nfts.id as nftId',
          'nfts.tokenId as tokenId',
          'nfts.smallImage as thumbnailUrl',
          'nfts.name as nftName',
          'nfts.marketStatus as marketStatus',
          'CASE WHEN market_status = 1 THEN( SELECT sn.price FROM sale_nft sn WHERE sn.nft_id = nfts.id AND sn.action = 0 AND sn.status = 1 LIMIT 1) WHEN market_status in (2, 4) THEN( SELECT aus.highest_price FROM auction_session aus WHERE aus.nft_id = nfts.id AND aus.status in (0, 1, 2, 3) limit 1 ) ELSE "" END as price',
          'nfts.receiveToken as receiveToken',
          'networks.name as network',
          'nfts.status as status',
          'nfts.isDraft as isDraft',
          'nfts.isMigrated as isMigrated',
          'collections.id as collectionId',
          'collections.contractAddress as collectionAddress',
          'networks.id as networkId',
          'nfts.royalty as royalty',
        ])
        .addSelect(
          '(SELECT COUNT(*) FROM user_like_nft uln WHERE uln.nft_id = nfts.id AND uln.status = 1) as totalLike',
        )
        // .addSelect(
        //   `(SELECT round(sum(${selectByReceiveToken} *(n.royalty/100)), 6) FROM sale_nft sn LEFT JOIN nfts nft ON nft.id = sale_nft.nft_id where sale_nft.nft_id = nfts.id  and action in (${SaleNftType.BUY_NFT},${SaleNftType.ACCEPT_BID_NFT},${SaleNftType.ACCEPT_NFT})) as totalPrice`
        // )
        .leftJoin('networks', 'networks', 'networks.id = nfts.network')
        .leftJoin(
          'collections',
          'collections',
          'collections.id = nfts.collections',
        )
        .leftJoin(
          'owner_nft',
          'owner_nft',
          'owner_nft.nfts = nfts.id and owner_nft.saleTotal > 0',
        )
        .limit(size)
        .offset(size * (page - 1));

      const volumeTraded = this.nftsRepository
        .createQueryBuilder('nfts')
        .select(
          `ifnull(round(sum(${selectByReceiveToken} *(nfts.royalty/100)), 6), 0)  as totalPrice `,
        )
        .where(
          `sn.action in (${SaleNftType.BUY_NFT}, ${SaleNftType.ACCEPT_BID_NFT}, ${SaleNftType.ACCEPT_NFT})`,
        )
        .leftJoin('nfts.saleNft', 'sn');

      query.andWhere('nfts.isDraft = 0');
      if (collection) {
        query.andWhere('collections.id = :collection', { collection });
      }
      if (network) {
        query.andWhere('networks.id = :network', { network });
      }

      switch (ownerNft) {
        case 'created':
          query.andWhere('nfts.user = :user', { user: user.id });
          break;
        case 'collected':
          const getNftOfUser = await this.nftsRepository
            .createQueryBuilder('nfts')
            .select(['nfts.id as nftId'])
            .where('nfts.user = :user', { user: user.id })
            .getRawMany();

          query
            .andWhere('owner_nft.user = :user', {
              user: user.id,
            })
            .andWhere('owner_nft.nfts NOT IN (:nftId)', {
              nftId: getNftOfUser.map((nft) => {
                return nft.nftId;
              }),
            })
            .andWhere('nfts.user NOT IN (:user)', { user: user.id });
          break;
        default:
          query
            .andWhere('(nfts.user = :user or owner_nft.user = :user)', {
              user: user.id,
            })
            .orderBy('nfts.createdAt', 'DESC');
      }
      const [list, count] = await Promise.all([
        query.getRawMany(),
        query.getCount(),
      ]);

      await Promise.all(
        list.map(async (nft) => {
          nft['totalPrice'] = (
            await volumeTraded
              .andWhere('nfts.id = :id', { id: nft.nftId })
              .getRawOne()
          ).totalPrice;
        }),
      );
      return {
        list,
        count,
      };
    } catch (error) {
      console.log(error);
    }
  }

  async getListNftsMarket(
    category: string,
    pageIndex: number,
    pageSize: number,
  ) {
    try {
      const page = pageIndex || 1;
      const size = pageSize || 10;

      const query = this.nftsRepository
        .createQueryBuilder('nfts')
        .select([
          'nfts.id as nftId',
          'nfts.name as name',
          'nfts.category as category',
          'nfts.standardType as standardType',
          'nfts.description as description',
          'nfts.marketStatus as marketNftStatus',
          'nfts.receiveToken as tokenPrice',
          `CASE WHEN nfts.category IN (${NFT_CATEGORIES.VIDEO}, ${NFT_CATEGORIES.AUDIO}) THEN nfts.previewImage ELSE nfts.smallImage END as mediaUrl `,
          'nfts.tokenId as tokenId',
          'nfts.isMigrated as isMigrated',
          'category.name as categoryName',
          `CASE WHEN market_status = ${NFT_MARKET_STATUS.ON_FIX_PRICE} 
            THEN (SELECT sn.price FROM sale_nft sn WHERE sn.nft_id = nfts.id AND sn.action = ${
              SaleNftType.PUT_ON_SALE
            } AND sn.status = ${SaleNftStatus.SUCCESS} LIMIT 1)
            WHEN market_status in (${[
              NFT_MARKET_STATUS.ON_AUCTION,
              NFT_MARKET_STATUS.END_AUCTION,
              NFT_MARKET_STATUS.IMCOMMING_AUCTION,
              NFT_MARKET_STATUS.CANCEL_AUCTION,
            ].join(',')}) 
            THEN (SELECT aus.highest_price FROM auction_session aus WHERE aus.nft_id = nfts.id AND aus.status in (
              ${[
                AuctionSessionStatus.NEW,
                AuctionSessionStatus.ACTIVE,
                AuctionSessionStatus.END,
                AuctionSessionStatus.UNSUCCESSFUL,
                AuctionSessionStatus.CANCEL,
              ].join(',')}
              ) LIMIT 1) ELSE "" END as price`,
        ])
        .leftJoin('category', 'category', 'category.id = nfts.category')
        .andWhere(
          `nfts.marketStatus in (${[
            NFT_MARKET_STATUS.ON_FIX_PRICE,
            NFT_MARKET_STATUS.ON_AUCTION,
            NFT_MARKET_STATUS.END_AUCTION,
            NFT_MARKET_STATUS.IMCOMMING_AUCTION,
            NFT_MARKET_STATUS.CANCEL_AUCTION,
          ].join(',')})`,
        );

      if (category) {
        query.andWhere('category.name LIKE :category', {
          category: '%' + category + '%',
        });
      }

      query
        .orderBy('nfts.createdAt', 'DESC')
        .limit(size)
        .offset(size * (page - 1));

      const [list, count] = await Promise.all([
        query.getRawMany(),
        query.getCount(),
      ]);

      const listNftResponse = await this.getNftReferData(list);

      return {
        list: listNftResponse,
        count,
      };
    } catch (error) {
      console.log(error);
      return {
        code: 500,
        message: 'Server error!',
      };
    }
  }

  async getAllNftMarket(
    pageIndex: number,
    pageSize: number,
    sortFilter: number,
    categoryFilter: number,
    userId,
  ) {
    try {
      const page = pageIndex || 1;
      const size = pageSize || 10;

      const subQuery = this.nftsRepository
        .createQueryBuilder('nfts')
        .select([
          'nfts.id as nftId',
          'nfts.name as name',
          'nfts.category as category',
          'nfts.standardType as standardType',
          'nfts.description as description',
          'nfts.marketStatus as marketNftStatus',
          `CASE WHEN nfts.category IN (${NFT_CATEGORIES.VIDEO}, ${NFT_CATEGORIES.AUDIO}) THEN nfts.previewImage ELSE nfts.smallImage END as mediaUrl `,
          'nfts.tokenId as tokenId',
          'nfts.isMigrated as isMigrated',
          'category.name as categoryName',
          `CASE WHEN nfts.market_status = ${NFT_MARKET_STATUS.ON_FIX_PRICE} 
          THEN (SELECT sn.price FROM sale_nft sn WHERE sn.nft_id = nfts.id AND sn.action = ${
            SaleNftType.PUT_ON_SALE
          } AND sn.status = ${
            SaleNftStatus.SUCCESS
          } ORDER BY sn.id DESC LIMIT 1)
          WHEN nfts.market_status in (${[
            NFT_MARKET_STATUS.ON_AUCTION,
            NFT_MARKET_STATUS.END_AUCTION,
            NFT_MARKET_STATUS.IMCOMMING_AUCTION,
            NFT_MARKET_STATUS.CANCEL_AUCTION,
          ].join(',')}) 
          THEN (SELECT aus.highest_price FROM auction_session aus WHERE aus.nft_id = nfts.id AND aus.status in (
            ${[
              AuctionSessionStatus.NEW,
              AuctionSessionStatus.ACTIVE,
              AuctionSessionStatus.END,
              AuctionSessionStatus.UNSUCCESSFUL,
              AuctionSessionStatus.CANCEL,
            ].join(',')}
            ) ORDER BY aus.id DESC LIMIT 1) ELSE 0 END as price`,
          `CASE WHEN nfts.market_status = ${NFT_MARKET_STATUS.ON_FIX_PRICE} 
            THEN (SELECT sn.receive_token FROM sale_nft sn WHERE sn.nft_id = nfts.id AND sn.action = ${
              SaleNftType.PUT_ON_SALE
            } AND sn.status = ${
            SaleNftStatus.SUCCESS
          } ORDER BY sn.id DESC LIMIT 1)
            WHEN nfts.market_status in (${[
              NFT_MARKET_STATUS.ON_AUCTION,
              NFT_MARKET_STATUS.END_AUCTION,
              NFT_MARKET_STATUS.IMCOMMING_AUCTION,
              NFT_MARKET_STATUS.CANCEL_AUCTION,
            ].join(',')}) 
            THEN (SELECT aus.receive_token FROM auction_session aus WHERE aus.nft_id = nfts.id AND aus.status in (
              ${[
                AuctionSessionStatus.NEW,
                AuctionSessionStatus.ACTIVE,
                AuctionSessionStatus.END,
                AuctionSessionStatus.UNSUCCESSFUL,
                AuctionSessionStatus.CANCEL,
              ].join(',')}
              ) ORDER BY aus.id DESC LIMIT 1) ELSE NULL END as tokenPrice`,
          '(SELECT COUNT(*) FROM user_like_nft uln WHERE uln.nft_id = nfts.id AND uln.status = 1) as totalLike',
          'nfts.created_at as createdAt',
        ])
        .leftJoin('category', 'category', 'category.id = nfts.category')
        .andWhere('nfts.isDraft = 0');

      if (userId) {
        subQuery.addSelect(
          `(SELECT COUNT(*) FROM user_like_nft uln WHERE uln.nft_id = nfts.id AND uln.status = 1 AND uln.user_id = ${userId}) as isLike`,
        );
      }
      if (categoryFilter || categoryFilter == 0) {
        switch (categoryFilter) {
          case FILTER_NFT_CATEGORY.TRENDING:
            let d = new Date();
            let year = d.getFullYear();
            let month = d.getMonth() + 1;
            let day = d.getDate();

            const stringDate = year + '/' + month + '/' + day;
            subQuery
              .addSelect(
                `(SELECT count(*) from sale_nft where sale_nft.nft_id = nfts.id and sale_nft.created_at
          between DATE_SUB('${stringDate}', INTERVAL 7 DAY) and '${stringDate}' ) as totalSale`,
              )
              .orderBy('totalSale', 'DESC');
            subQuery.andWhere(
              `nfts.marketStatus != ${NFT_MARKET_STATUS.NOT_ON_SALE}`,
            );
            break;
          case FILTER_NFT_CATEGORY.ART:
          case FILTER_NFT_CATEGORY.GIF:
          case FILTER_NFT_CATEGORY.IMAGE:
          case FILTER_NFT_CATEGORY.MOVIE:
          case FILTER_NFT_CATEGORY.MUSIC:
            subQuery.andWhere(`category.id = ${categoryFilter}`);
            break;
          default:
            break;
        }
      }
      const exchangeRates =
        await this.rateCoinService.getExchangeRateByNetworkTokens('ETH');
      let selectByReceiveToken = '';
      exchangeRates.forEach((exchangeRate) => {
        selectByReceiveToken += ` WHEN '${exchangeRate.from_coin}' THEN sn_nft.price * ${exchangeRate.exchange_rate}`;
      });
      selectByReceiveToken = `(CASE sn_nft.tokenPrice ${selectByReceiveToken} else sn_nft.price END)`;

      const query = await getManager()
        .createQueryBuilder()
        .select([
          'sn_nft.*',
          `ifnull(ROUND(${selectByReceiveToken}, 10), 0) as priceInETH`,
        ])
        .from('(' + subQuery.getQuery() + ')', 'sn_nft')
        .orderBy('sn_nft.createdAt', 'DESC');

      if (sortFilter || sortFilter == 0) {
        switch (sortFilter) {
          case FILTER_NFT_MARKET.MOST_LIKE:
            query
              .orderBy('sn_nft.totalLike', 'DESC')
              .addOrderBy('sn_nft.createdAt', 'DESC');
            break;
          case FILTER_NFT_MARKET.ON_SALE:
            query.andWhere(
              `(SELECT sale_nft.action from sale_nft where sale_nft.nft_id = sn_nft.nftId ORDER BY created_at desc limit 1) = ${SaleNftType.PUT_ON_SALE}`,
            );
            break;
          case FILTER_NFT_MARKET.RECENTLY_CREATED:
            query.orderBy('sn_nft.createdAt', 'DESC');
            break;
          case FILTER_NFT_MARKET.LOW_TO_HIGH:
            query
              .orderBy('priceInETH', 'ASC')
              .addOrderBy('price', 'ASC')
              .addOrderBy('sn_nft.createdAt', 'DESC');
            break;
          case FILTER_NFT_MARKET.HIGH_TO_LOW:
            query
              .orderBy('priceInETH', 'DESC')
              .addOrderBy('price', 'DESC')
              .addOrderBy('sn_nft.createdAt', 'DESC');
            break;
          case FILTER_NFT_MARKET.ON_AUTION:
            query.andWhere(
              `(SELECT sale_nft.action from sale_nft where sale_nft.nft_id = sn_nft.nftId ORDER BY created_at desc limit 1) = ${SaleNftType.PUT_AUCTION}`,
            );
            break;
          default:
            break;
        }
      }

      const [queryString, params] = query.getQueryAndParameters();
      const countQuery = getConnection()
        .query(`SELECT COUNT(*) AS count FROM (${queryString}) a`, params)
        .then((result) => {
          return result[0];
        });

      const [list, count] = await Promise.all([
        query
          .limit(size)
          .offset(size * (page - 1))
          .getRawMany(),
        countQuery,
      ]);

      const listNftResponse = await this.getNftReferData(list);
      return {
        list: listNftResponse ? listNftResponse : list,
        count: Number(count.count),
      };
    } catch (error) {
      console.log(error);
      return {
        code: 500,
        message: 'Server error!',
      };
    }
  }

  async getNftByUserAddress(getNftByUserAddressDto: GetNftByUserAddressDto) {
    try {
      const { address, pageIndex, pageSize, categoryFilter } =
        getNftByUserAddressDto;
      const user = await this.userRepository.findOne({
        relations: ['userWallet'],
        where: {
          userWallet: {
            address: address?.toLowerCase(),
          },
        },
      });
      const page = pageIndex || 1;
      const size = pageSize || 10;
      let query = this.nftsRepository
        .createQueryBuilder('nfts')
        .select([
          'nfts.id as nftId',
          'nfts.name as name',
          'nfts.category as category',
          'nfts.standardType as standardType',
          'nfts.description as description',
          'nfts.marketStatus as marketNftStatus',
          'nfts.receiveToken as tokenPrice',
          `CASE WHEN nfts.category IN (${NFT_CATEGORIES.VIDEO}, ${NFT_CATEGORIES.AUDIO}) THEN nfts.previewImage ELSE nfts.smallImage END as mediaUrl `,
          'nfts.tokenId as tokenId',
          'nfts.isMigrated as isMigrated',
          'category.name as categoryName',
          `CASE WHEN market_status = ${NFT_MARKET_STATUS.ON_FIX_PRICE} 
          THEN (SELECT sn.price FROM sale_nft sn WHERE sn.nft_id = nfts.id AND sn.action = ${
            SaleNftType.PUT_ON_SALE
          } AND sn.status = ${SaleNftStatus.SUCCESS} LIMIT 1)
          WHEN market_status in (${[
            NFT_MARKET_STATUS.ON_AUCTION,
            NFT_MARKET_STATUS.END_AUCTION,
            NFT_MARKET_STATUS.IMCOMMING_AUCTION,
            NFT_MARKET_STATUS.CANCEL_AUCTION,
          ].join(',')}) 
          THEN (SELECT aus.highest_price FROM auction_session aus WHERE aus.nft_id = nfts.id AND aus.status in (
            ${[
              AuctionSessionStatus.NEW,
              AuctionSessionStatus.ACTIVE,
              AuctionSessionStatus.END,
              AuctionSessionStatus.UNSUCCESSFUL,
              AuctionSessionStatus.CANCEL,
            ].join(',')}
            ) LIMIT 1) ELSE 0 END as price`,
        ])
        .distinctOn(['nfts.id']);
      if (categoryFilter) {
        switch (categoryFilter) {
          case CategoryNftUser.CREATE:
            query
              .leftJoin('users', 'users', 'users.id = nfts.user_id')
              .leftJoin(
                'user-wallet',
                'userWallet',
                'userWallet.id = users.user_wallet_id',
              )
              .where('userWallet.address = :address', { address });
            break;
          case CategoryNftUser.OWNER:
            query
              .leftJoin('owner_nft', 'ownerNft', 'ownerNft.nfts_id = nfts.id')
              .leftJoin('users', 'users', 'users.id = nfts.user_id')
              .leftJoin(
                'user-wallet',
                'userWallet',
                'userWallet.id = users.user_wallet_id',
              )
              .andWhere(
                '(ownerNft.sale_total = 1 or ownerNft.sale_total is null)',
              )
              .andWhere(
                ':userId = CASE WHEN EXISTS (select * from owner_nft where owner_nft.nfts_id = nfts.id and owner_nft.sale_total = 1) THEN ownerNft.user_id ELSE nfts.user_id  END',
                { userId: user.id },
              );
            break;
        }
      }
      query
        .addSelect(
          '(SELECT COUNT(*) FROM user_like_nft uln WHERE uln.nft_id = nfts.id AND uln.status = 1) as totalLike',
        )
        .leftJoin('category', 'category', 'category.id = nfts.category')
        .andWhere('nfts.isDraft = 0')
        .orderBy('nfts.createdAt', 'DESC')
        .limit(size)
        .offset(size * (page - 1));

      let [list, count] = await Promise.all([
        query.getRawMany(),
        query.getCount(),
      ]);
      if (getNftByUserAddressDto.userId) {
        list = await this.attackIsLikeData(getNftByUserAddressDto.userId, list);
      }

      const listNftResponse = await this.getNftReferData(list);
      return {
        list: listNftResponse ? listNftResponse : list,
        count,
      };
    } catch (error) {
      console.log(error);
      return {
        code: 500,
        message: 'Server error!',
      };
    }
  }

  async getListNftsByCollection(
    page: number = 1,
    limit: number = 10,
    collectionId: number,
    collectionAddress: string,
    isRandom: boolean = false,
    currentNftId: string,
    userId: string,
    networkId: string,
  ) {
    try {
      const query = this.nftsRepository
        .createQueryBuilder('nfts')
        .select([
          'nfts.id as nftId',
          'nfts.name as name',
          'nfts.category as category',
          'nfts.standardType as standardType',
          'nfts.description as description',
          'nfts.marketStatus as marketNftStatus',
          'nfts.receiveToken as tokenPrice',
          `CASE WHEN nfts.category IN (${NFT_CATEGORIES.VIDEO}, ${NFT_CATEGORIES.AUDIO}) THEN nfts.previewImage ELSE nfts.smallImage END as mediaUrl `,
          'nfts.tokenId as tokenId',
          'nfts.isMigrated as isMigrated',
          `CASE WHEN market_status = ${NFT_MARKET_STATUS.ON_FIX_PRICE} 
            THEN (SELECT sn.price FROM sale_nft sn WHERE sn.nft_id = nfts.id AND sn.action = ${
              SaleNftType.PUT_ON_SALE
            } AND sn.status = ${SaleNftStatus.NEW} LIMIT 1) 
            WHEN market_status in (${[
              NFT_MARKET_STATUS.ON_AUCTION,
              NFT_MARKET_STATUS.END_AUCTION,
              NFT_MARKET_STATUS.IMCOMMING_AUCTION,
            ].join(',')}) 
            THEN (SELECT aus.highest_price FROM auction_session aus WHERE aus.nft_id = nfts.id AND aus.status in (
              ${[
                AuctionSessionStatus.NEW,
                AuctionSessionStatus.ACTIVE,
                AuctionSessionStatus.END,
                AuctionSessionStatus.UNSUCCESSFUL,
                AuctionSessionStatus.CANCEL,
              ].join(',')}
          ) LIMIT 1) ELSE nfts.price END as price`,
          '(SELECT COUNT(*) FROM user_like_nft uln WHERE uln.nft_id = nfts.id AND uln.status = 1) as totalLike',
        ])
        .leftJoin('networks', 'networks', 'networks.id = nfts.network')
        .leftJoin(
          'collections',
          'collections',
          'collections.id = nfts.collections',
        )
        .andWhere(`collections.networkId = ${networkId}`)
        .andWhere('nfts.isDraft = 0');

      if (userId) {
        query.addSelect(
          `(SELECT COUNT(*) FROM user_like_nft uln WHERE uln.nft_id = nfts.id AND uln.status = 1 AND uln.user_id = ${userId}) as isLike`,
        );
      }

      if (collectionId) {
        query.andWhere('nfts.collections = :collectionId', { collectionId });
      }

      if (collectionAddress) {
        query.andWhere('collections.contractAddress = :collectionAddress', {
          collectionAddress,
        });
      }

      if (currentNftId) {
        query.andWhere('nfts.id != :currentNftId', { currentNftId });
      }

      if (isRandom) {
        query.orderBy('RAND()').limit(limit);
      } else {
        query
          .orderBy('nfts.createdAt', 'DESC')
          .limit(limit)
          .offset(limit * (page - 1));
      }

      const [list, count] = await Promise.all([
        query.getRawMany(),
        query.getCount(),
      ]);

      if (!list || !list.length) {
        return {
          list,
          count,
        };
      }

      const listNftResponse = await this.getNftReferData(list);

      return {
        list: listNftResponse,
        count,
      };
    } catch (error) {
      return {
        code: 500,
        message: 'Server error!',
      };
    }
  }

  async getListNftsRanking(getListNftRandking: GetListNftsRankingDto) {
    try {
      const { limit, page, duration = 1, userId } = getListNftRandking;

      const conditionKey = `${NFTKey.RANKING}-${page}-${limit}-${duration}`;

      const cacheData = await this.getDataCacheFromRedis(conditionKey);

      if (cacheData) {
        const data = JSON.parse(cacheData);

        if (!data || !data.list || !data.list.length) {
          return data;
        }

        const nftIds = data.list.map((item) => item.nftId);

        // This here too slow query (T.T), need refactor
        let allUserLikeNfts = await this.userLikeNftRepository.find({
          where: {
            nftId: In(nftIds),
            status: 1,
          },
        });

        const userLikeNftsObjByNftId = _.groupBy(allUserLikeNfts, 'nftId');

        if (!userId) {
          data.list.forEach((item) => {
            delete item.isLike;
            item.totalLike = userLikeNftsObjByNftId[item.nftId]
              ? userLikeNftsObjByNftId[item.nftId].length
              : 0;
          });

          return data;
        }

        const userLikeNftList = await this.userLikeNftRepository.find({
          where: {
            userId,
            nftId: In(nftIds),
            status: 1,
          },
        });

        data.list.forEach((nft) => {
          nft.totalLike = userLikeNftsObjByNftId[nft.nftId]
            ? userLikeNftsObjByNftId[nft.nftId].length
            : 0;

          const existUserLike = _.find(
            userLikeNftList,
            (item) => item.nftId == nft.nftId,
          );

          if (existUserLike) {
            nft.isLike = 1;
            return;
          }

          nft.isLike = 0;
        });

        return data;
      }

      const query = this.nftsRepository.createQueryBuilder('nfts').select([
        'nfts.id as nftId',
        'nfts.name as name',
        'nfts.category as category',
        'nfts.standardType as standardType',
        'nfts.description as description',
        'nfts.marketStatus as marketNftStatus',
        'nfts.receiveToken as tokenPrice',
        `CASE WHEN nfts.category IN (${NFT_CATEGORIES.VIDEO}, ${NFT_CATEGORIES.AUDIO}) THEN nfts.previewImage ELSE nfts.smallImage END as mediaUrl `,
        'nfts.tokenId as tokenId',
        'nfts.isMigrated as isMigrated',
        `CASE WHEN market_status = ${NFT_MARKET_STATUS.ON_FIX_PRICE} 
            THEN (SELECT sn.price FROM sale_nft sn WHERE sn.nft_id = nfts.id AND sn.action = ${
              SaleNftType.PUT_ON_SALE
            } AND sn.status = ${SaleNftStatus.NEW} LIMIT 1) 
            WHEN market_status in (${[
              NFT_MARKET_STATUS.ON_AUCTION,
              NFT_MARKET_STATUS.END_AUCTION,
              NFT_MARKET_STATUS.IMCOMMING_AUCTION,
            ].join(',')}) 
            THEN (SELECT aus.highest_price FROM auction_session aus WHERE aus.nft_id = nfts.id AND aus.status in (
              ${[
                AuctionSessionStatus.NEW,
                AuctionSessionStatus.ACTIVE,
                AuctionSessionStatus.END,
                AuctionSessionStatus.UNSUCCESSFUL,
                AuctionSessionStatus.CANCEL,
              ].join(',')}
          ) LIMIT 1) ELSE nfts.price END as price`,
        `(SELECT COUNT(sn.id) FROM sale_nft sn WHERE nfts.marketStatus != ${NFT_MARKET_STATUS.NOT_ON_SALE} AND sn.nft_id = nfts.id AND DATEDIFF(NOW(), created_at) <= ${duration}) as totalActivities`,
        '(SELECT COUNT(*) FROM user_like_nft uln WHERE uln.nft_id = nfts.id AND uln.status = 1) as totalLike',
      ]);

      if (userId) {
        query.addSelect(
          `(SELECT COUNT(*) FROM user_like_nft uln WHERE uln.nft_id = nfts.id AND uln.status = 1 AND uln.user_id = ${userId}) as isLike`,
        );
      }

      query
        .andWhere('nfts.isDraft = 0')
        .andWhere(`nfts.market_status != ${NFT_MARKET_STATUS.NOT_ON_SALE}`)
        .orderBy('totalActivities', 'DESC')
        .limit(limit)
        .offset(limit * (page - 1));

      const [list, count] = await Promise.all([
        query.getRawMany(),
        query.getCount(),
      ]);

      const listNftResponse = await this.getNftReferData(list);

      const response = {
        list: listNftResponse,
        count,
      };

      await this.setDataCatchToRedis(conditionKey, response);

      return response;
    } catch (error) {
      console.log('error', error);
      return {
        code: 500,
        message: 'Server error!',
      };
    }
  }

  async connectRedis() {
    const client = createClient({
      url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
    });
    await client.connect();
    return client;
  }

  async getDataCacheFromRedis(key: string) {
    const clientRedis = await this.connectRedis();
    return await clientRedis.get(key);
  }

  async getDataCacheFromRedisByKeysPattern(key: string) {
    const clientRedis = await this.connectRedis();
    return await clientRedis.keys(key);
  }

  async setDataCatchToRedis(
    key: string,
    data: any,
    cacheTime: number = CACHE_TIME,
  ) {
    const clientRedis = await this.connectRedis();
    return await clientRedis.set(key, JSON.stringify(data), { EX: cacheTime });
  }

  async processUserLikeNft(userLikeNftDto: UserLikeNftDto, user: User) {
    const { nftId, status } = userLikeNftDto;
    const nft = await this.findById(nftId);
    if (!nft) {
      throw new BadRequestException(CustomErrorMessage['NFT.USER_NOT_FOUND']);
    }
    const nftLikedUser = await this.userLikeNftRepository.findOne({
      userId: user.id,
      nftId,
    });
    if (nftLikedUser) {
      return await this.userLikeNftRepository.update(nftLikedUser.id, {
        status,
      });
    }
    return await this.userLikeNftRepository.insert({
      userId: user.id,
      nftId,
      status,
    });
  }

  async getNftReferData(listNft) {
    if (!listNft || !listNft.length) {
      return [];
    }

    for (let item of listNft) {
      const networkNft = this.networkRepository
        .createQueryBuilder('networks')
        .select([
          'networks.name as networkName',
          'networks.id as networkId',
          'networks.image as avatar',
        ])
        .leftJoin('nfts', 'nfts', 'networks.id = nfts.network')
        .andWhere('nfts.id = :nftId', { nftId: item.nftId });

      const creatorNft = this.nftsRepository
        .createQueryBuilder('nfts')
        .select([
          'users.id as userId',
          'users.about as description',
          'users.avatar as avatar',
          'users.userName as name',
          'users.facebookSite as facebookLink',
          'users.instagramSite as instagramLink',
          'users.twitterSite as twitterLink',
          'users.role as role',
          '(select uw.address from `user-wallet` uw where uw.id = users.userWallet) as address',
        ])
        .leftJoin('users', 'users', 'users.id = nfts.user')
        .leftJoin('networks', 'networks', 'networks.id = nfts.network')
        .leftJoin(
          'collections',
          'collections',
          'collections.id = nfts.collections',
        )
        .andWhere('nfts.id = :nftId', { nftId: item.nftId });

      const collectionNft = this.collectionsRepository
        .createQueryBuilder('collections')
        .select([
          'collections.name as name',
          'collections.contractAddress as address',
          `IF (collections.iconImage IS NULL OR collections.iconImage = '', NULL, collections.iconImage) as avatar`,
        ])
        .leftJoin('nfts', 'nfts', 'collections.id = nfts.collections')
        .andWhere('nfts.id = :nftId', { nftId: item.nftId });

      const ownerQuery = this.ownerNftRepository
        .createQueryBuilder('ownerNft')
        .select([
          'ownerNft.user as userId',
          'users.userName as name',
          'users.avatar as avatar',
          'users.role as role',
          '(select uw.address from `user-wallet` uw where uw.id = users.userWallet) as address',
        ])
        .leftJoin('users', 'users', 'ownerNft.user = users.id')
        .where('ownerNft.nfts = :nftId', { nftId: item.nftId })
        .andWhere('ownerNft.saleTotal > 0');

      const [network, creator, collection, owner] = await Promise.all([
        networkNft.getRawOne(),
        creatorNft.getRawOne(),
        collectionNft.getRawOne(),
        ownerQuery.getRawOne(),
      ]);
      item['network'] = network;
      item['creator'] = creator;
      item['collection'] = collection;
      item['owner'] = owner ? owner : creator;
      item['saleData'] = {
        fixPrice: null,
        auction: null,
      };

      if (item.marketNftStatus == NFT_MARKET_STATUS.ON_FIX_PRICE) {
        const putOnSales = await this.saleNftRepository
          .createQueryBuilder('sn')
          .select([
            'sn.id, sn.price, sn.receiveToken as tokenPrice, sn.action, sn.status, sn.originalPrice as originalPrice, sn.networkTokenId as networkTokenId, networkToken.icon as tokenPriceIcon',
          ])
          .leftJoin(
            'network_tokens',
            'networkToken',
            'networkToken.id = sn.networkTokenId',
          )
          .where('sn.nft = :id', { id: item.nftId })
          .andWhere('sn.status = :status', { status: SaleNftStatus.SUCCESS })
          .andWhere('sn.action = :action', { action: SaleNftType.PUT_ON_SALE })
          .andWhere('sn.fromUser = :fromUser', { fromUser: owner.userId })
          .orderBy('sn.id', 'DESC')
          .getRawOne();

        item['saleData'].fixPrice = putOnSales;
        item.tokenPriceIcon = putOnSales ? putOnSales.tokenPriceIcon : '';
      }

      if (
        [
          NFT_MARKET_STATUS.IMCOMMING_AUCTION,
          NFT_MARKET_STATUS.ON_AUCTION,
          NFT_MARKET_STATUS.END_AUCTION,
          NFT_MARKET_STATUS.CANCEL_AUCTION,
        ].includes(item.marketNftStatus)
      ) {
        const auction = await this.saleNftRepository
          .createQueryBuilder('sn')
          .select([
            'acs.id as auctionId, acs.receiveToken as tokenPrice, acs.status, acs.networkTokenId as networkTokenId, networkToken.icon as tokenPriceIcon' +
              ', acs.highestPrice as highestPrice, acs.startPrice as startPrice, acs.endPrice as endPrice, acs.stepPrice as stepPrice' +
              ', acs.startTime as startTime, acs.endTime as endTime',
          ])
          .leftJoin('auction_session', 'acs', 'sn.auctionSessionId = acs.id')
          .leftJoin(
            'network_tokens',
            'networkToken',
            'networkToken.id = acs.networkTokenId',
          )
          .where('sn.nft = :id', { id: item.nftId })
          .andWhere('sn.action = :action', { action: SaleNftType.PUT_AUCTION })
          .andWhere('sn.fromUser = :fromUser', { fromUser: owner.userId })
          .andWhere('acs.status IN (:acsStatus)', {
            acsStatus: [
              AuctionSessionStatus.NEW,
              AuctionSessionStatus.ACTIVE,
              AuctionSessionStatus.END,
              AuctionSessionStatus.UNSUCCESSFUL,
              AuctionSessionStatus.CANCEL,
            ],
          })
          .orderBy('acs.id', 'DESC')
          .getRawOne();

        if (auction) {
          const highestBidder =
            await this.auctionSessionService.getHighestBidder(
              auction.auctionId,
            );
          auction.highestBidder = highestBidder?.uw_address
            ? highestBidder.uw_address
            : '';
        }

        item['saleData'].auction = auction;

        item.tokenPriceIcon = auction ? auction.tokenPriceIcon : '';
      }
    }

    return listNft;
  }

  async getListNftsSlider(getListNftsSliderDto: GetListNftsSliderDto) {
    try {
      const { limit = 15, page = 1 } = getListNftsSliderDto;

      const conditionKey = `${NFTKey.SLIDER}-${page}-${limit}`;
      const cacheData = await this.getDataCacheFromRedis(conditionKey);

      if (cacheData) {
        return JSON.parse(cacheData);
      }

      const startDateOfWeek = moment()
        .startOf('week')
        .startOf('days')
        .toISOString();

      const cacheOldSliderNftIdsKey = `${NFTKey.SLIDER}-OLD-ID-${startDateOfWeek}-${page}-${limit}`;
      let listKeys = await this.getDataCacheFromRedisByKeysPattern(
        `${NFTKey.SLIDER}-OLD-ID-*`,
      );

      let cacheOldNftIds = [];

      if (listKeys && listKeys.length) {
        for (const key of listKeys) {
          const cacheOldNftData = await this.getDataCacheFromRedis(key);
          const data = JSON.parse(cacheOldNftData);

          if (!data || !data.ids) {
            continue;
          }

          cacheOldNftIds.push(...data.ids);
        }
      }

      const query = this.nftsRepository
        .createQueryBuilder('nfts')
        .select([
          'nfts.id as nftId',
          'nfts.name as name',
          'nfts.category as category',
          'nfts.standardType as standardType',
          'nfts.description as description',
          'nfts.receiveToken as tokenPrice',
          `CASE WHEN nfts.category IN (${NFT_CATEGORIES.VIDEO}, ${NFT_CATEGORIES.AUDIO}) THEN nfts.previewImage ELSE nfts.smallImage END as mediaUrl `,
          'nfts.tokenId as tokenId',
          'nfts.isMigrated as isMigrated',
          'networks.name as networkName',
          'networks.id as networkId',
          'collections.name as collectionName',
          'collections.contractAddress as collectionAddress',
          'users.userName as ownerName',
          '(select uw.address from `user-wallet` uw where uw.id = users.userWallet) as ownerAddress',
          '(SELECT COUNT(*) FROM user_like_nft uln WHERE uln.nft_id = nfts.id AND uln.status = 1) as totalLike',
        ])
        .leftJoin('networks', 'networks', 'networks.id = nfts.network')
        .leftJoin(
          'collections',
          'collections',
          'collections.id = nfts.collections',
        )
        .leftJoin(
          'owner_nft',
          'owner_nft',
          'owner_nft.nfts = nfts.id and owner_nft.saleTotal > 0',
        )
        .leftJoin('users', 'users', 'owner_nft.user = users.id')
        .andWhere('nfts.isDraft = 0')
        .andWhere(
          '(SELECT COUNT(*) FROM user_like_nft uln WHERE uln.nft_id = nfts.id AND uln.status = 1) > 0',
        );

      if (cacheOldNftIds && cacheOldNftIds.length) {
        query.andWhere(`nfts.id NOT IN (${cacheOldNftIds.join(',')})`);
      }

      query
        .orderBy('totalLike', 'DESC')
        .limit(limit)
        .offset(limit * (page - 1));

      const [list, count] = await Promise.all([
        query.getRawMany(),
        query.getCount(),
      ]);

      if (!list || !list.length) {
        return {
          list: [],
          count,
        };
      }

      const listNFt = list.map((item) => {
        const pickItem = _.omit(item, [
          'networkName',
          'networkId',
          'collectionName',
          'collectionAddress',
          'ownerName',
          'ownerAddress',
        ]);
        return {
          ...pickItem,
          collection: {
            name: item.collectionName,
            address: item.collectionAddress,
          },
          network: {
            networkName: item.networkName,
          },
          owner: {
            name: item.ownerName,
            address: item.ownerAddress,
          },
        };
      });

      const response = {
        list: listNFt || [],
        count,
      };

      // set redis for listSLider current week
      const currentDate = moment();
      const nextMonday = moment().add(7, 'days').startOf('weeks');
      const diffTimes = nextMonday.diff(currentDate, 'seconds');

      await this.setDataCatchToRedis(conditionKey, response, diffTimes);

      // set redis for list old slider
      const currentNftIds = list.map((item) => item.nftId) || [];

      const nextMonday4Week = moment().add(28, 'days').startOf('weeks');
      const diffTimeNextMonday4Week = nextMonday4Week.diff(
        currentDate,
        'seconds',
      );

      await this.setDataCatchToRedis(
        cacheOldSliderNftIdsKey,
        { ids: currentNftIds },
        diffTimeNextMonday4Week,
      );

      return response;
    } catch (error) {
      return {
        code: 500,
        message: 'Server error!',
      };
    }
  }

  async getListNftsDisCover(getListNftsDisCover: GetListNftsDiscoverDto) {
    try {
      const { page = 1, limit = 10, userId } = getListNftsDisCover;

      // get nftIds from sale nft with action in 3,4,25 ORDER BY createdAt
      const queryNft = this.saleNftRepository
        .createQueryBuilder('sale_nft')
        .select(['nft_id as nftId', 'MAX(sale_nft.created_at) as maxCreatedAt'])
        .andWhere(
          `action IN (${[
            SaleNftType.ACCEPT_BID_NFT,
            SaleNftType.ACCEPT_NFT,
            SaleNftType.BUY_NFT,
          ].join(',')})`,
        )
        .leftJoin('nfts', 'nfts', 'nfts.id = sale_nft.nft_id')
        .where('nfts.isDraft = 0')
        .groupBy('nftId')
        .orderBy('maxCreatedAt', 'DESC')
        .limit(limit)
        .offset(limit * (page - 1));

      const [listNft, count] = await Promise.all([
        queryNft.getRawMany(),
        queryNft.getCount(),
      ]);

      if (!listNft || !listNft.length) {
        return {
          list: [],
          count: 0,
        };
      }
      let nftIds = listNft.map((item) => item.nftId);

      const query = this.nftsRepository
        .createQueryBuilder('nfts')
        .select([
          'nfts.id as nftId',
          'nfts.name as name',
          'nfts.category as category',
          'nfts.standardType as standardType',
          'nfts.marketStatus as marketNftStatus',
          'nfts.receiveToken as tokenPrice',
          `CASE WHEN nfts.category IN (${NFT_CATEGORIES.VIDEO}, ${NFT_CATEGORIES.AUDIO}) THEN nfts.previewImage ELSE nfts.smallImage END as mediaUrl `,
          'nfts.tokenId as tokenId',
          'nfts.isMigrated as isMigrated',
          `CASE WHEN market_status = ${NFT_MARKET_STATUS.ON_FIX_PRICE} 
            THEN (SELECT sn.price FROM sale_nft sn WHERE sn.nft_id = nfts.id AND sn.action = ${
              SaleNftType.PUT_ON_SALE
            }
            AND sn.status = ${SaleNftStatus.NEW} LIMIT 1) 
            WHEN market_status in (${[
              NFT_MARKET_STATUS.ON_AUCTION,
              NFT_MARKET_STATUS.END_AUCTION,
              NFT_MARKET_STATUS.IMCOMMING_AUCTION,
            ].join(',')}) 
            THEN (SELECT aus.highest_price FROM auction_session aus WHERE aus.nft_id = nfts.id AND aus.status in (
              ${[
                AuctionSessionStatus.NEW,
                AuctionSessionStatus.ACTIVE,
                AuctionSessionStatus.END,
                AuctionSessionStatus.UNSUCCESSFUL,
                AuctionSessionStatus.CANCEL,
              ].join(',')}
            ) LIMIT 1) ELSE nfts.price END as price`,
          '(SELECT COUNT(*) FROM user_like_nft uln WHERE uln.nft_id = nfts.id AND uln.status = 1) as totalLike',
        ])
        .andWhere(`nfts.id IN (${nftIds.join(',')})`);

      if (userId) {
        query.addSelect(
          `(SELECT COUNT(*) FROM user_like_nft uln WHERE uln.nft_id = nfts.id AND uln.status = 1 AND uln.user_id = ${userId}) as isLike`,
        );
      }
      query.groupBy('nfts.id').orderBy('nfts.createdAt', 'DESC');

      const list = await query.getRawMany();

      if (!list || !list.length) {
        return {
          list: [],
          count,
        };
      }

      const listNftResponse = await this.getNftReferData(list);

      return {
        list: listNftResponse || [],
        count,
      };
    } catch (error) {
      return {
        code: 500,
        message: 'Server error!',
      };
    }
  }

  async attackIsLikeData(userId: number, nftList) {
    const nftIds = nftList.map((nft) => {
      return nft.nftId;
    });
    const userLikeNftList = await this.userLikeNftRepository.find({
      where: {
        userId,
        nftId: In(nftIds),
        status: LikeStatus.LIKE,
      },
    });
    var likeDataObj = userLikeNftList.reduce(
      (obj, item) => ((obj[item.nftId] = item.status), obj),
      {},
    );
    for (let key in nftList) {
      nftList[key].isLike = likeDataObj[nftList[key].nftId] ?? 0;
    }
    return nftList;
  }

  // update NFT for logined user
  async updateNFTForLoginedUser(user: User) {
    try {
      await this.redisService.connectRedis();
      const userAddress = user.userWallet.address;

      if (
        !(await this.redisService.getKeyCached(`update-nft-for-` + userAddress))
      ) {
        const allNFTsMolaris = await this.crawlAllNFTsByUserAddress(
          userAddress,
        );

        // filter NFT By Collections
        const allCollectionsAddress = (
          await this.collectionsService.getAllCollectionOfExchange()
        ).map((collection) => collection.contractAddress.toLowerCase());

        const allAcceptedNFTsMolaris = allNFTsMolaris.filter((nft) =>
          allCollectionsAddress.includes(nft.token_address),
        );
        const allNFTsUser = (
          await this.ownerNftService.findAllNFTsByOwnerUser(user)
        ).map((item) => item.nfts);

        await this.syncNFTData(allAcceptedNFTsMolaris, allNFTsUser, user);

        await this.redisService.setKeyCached(
          `update-nft-for-` + userAddress,
          1,
          CACHE_TIME,
        );
      }

      await this.redisService.disConnectRedis();
    } catch (error) {
      return {
        code: 500,
        message: error.message,
      };
    }
  }

  async syncNFTData(allNFTsMolaris, allNFTsUser, user: User) {
    const allNFTsMolarisWithKey = allNFTsMolaris.reduce(
      (obj, item) => ({
        ...obj,
        [item.chainId + '_' + item.token_address + '_' + item.token_id]: item,
      }),
      {},
    );

    const allNFTsUserWithKey = allNFTsUser.reduce(
      (obj, item) => ({
        ...obj,
        [item.collections.network.chainId +
        '_' +
        item.collections.contractAddress.toLowerCase() +
        '_' +
        item.tokenId.toLowerCase()]: item,
      }),
      {},
    );

    const newNFTs = [];
    const nftNeedUpdateToOwner = [];
    const nftNeedUpdateToOtherOwner = [];

    for (let key in allNFTsMolarisWithKey) {
      if (!allNFTsUserWithKey[key]) {
        // case 1: save new nft
        newNFTs.push(allNFTsMolarisWithKey[key]);
      } else {
        // case 2: update owner nft
        const ownerNFT = await this.ownerNftService.findOwnerByNftid(
          allNFTsUserWithKey[key].id,
        );

        const ownerAddress = ownerNFT[0]?.user?.userWallet?.address;

        if (
          !compareAddress(ownerAddress, allNFTsMolarisWithKey[key].owner_of)
        ) {
          nftNeedUpdateToOwner.push(allNFTsUserWithKey[key]);
        }
      }
    }

    // case 3: update none owner nft
    for (let key in allNFTsUserWithKey) {
      if (!allNFTsMolarisWithKey[key]) {
        const ownerNFT = await this.ownerNftService.findOwnerByNftid(
          allNFTsUserWithKey[key].id,
        );
        const ownerAddress = ownerNFT[0]?.user?.userWallet?.address;
        //check owner address not in dex
        if (
          compareAddress(ownerAddress, user.userWallet.address) &&
          allNFTsUserWithKey[key].marketStatus === 0
        ) {
          nftNeedUpdateToOtherOwner.push(allNFTsUserWithKey[key]);
        }
      }
    }

    // console.log(nftNeedUpdateToOwner)

    await Promise.all([
      this.addNewMolarisNFTs(newNFTs, user),
      this.updateToOwnerNFTs(nftNeedUpdateToOwner, user),
      this.updateToOtherOwnerNFTs(nftNeedUpdateToOtherOwner),
    ]);
  }

  async crawlAllNFTsByUserAddress(address: string) {
    const networksList = await this.networkService.findAll();
    const chainIdsList = networksList.map(
      (networksList) => networksList.chainId,
    );

    const crawlNFTsByChainPromises = [];
    chainIdsList.map((chainId: number) => {
      crawlNFTsByChainPromises.push(
        this.crawlNFTsByUserAdressEachNetwork(address, chainId),
      );
    });

    const nftsEachNetwork = await Promise.all(crawlNFTsByChainPromises);
    return nftsEachNetwork.reduce((pre, cur) => (pre = [...pre, ...cur]), []);
  }

  async crawlNFTsByUserAdressEachNetwork(address: string, chainId: number) {
    const nftsUserOnNetwork = [];

    const nftMoralisFirstPage = await this.crawlNFTsByMoralis(address, chainId);
    nftsUserOnNetwork.push(...nftMoralisFirstPage.result);

    const pagesTotal = Math.ceil(
      nftMoralisFirstPage.total / nftMoralisFirstPage.page_size,
    );

    let cursor = nftMoralisFirstPage.cursor;
    if (pagesTotal > 1) {
      for (let page = 1; page < pagesTotal; page++) {
        const nftMoralisCurrentPage = await this.crawlNFTsByMoralis(
          address,
          chainId,
          cursor,
        );
        cursor = nftMoralisCurrentPage.cursor;
        nftsUserOnNetwork.push(...nftMoralisCurrentPage.result);
      }
    }

    return nftsUserOnNetwork.map((item) => ({ ...item, chainId: chainId }));
  }

  async crawlNFTsByMoralis(address: string, chainId: number, cursor?: string) {
    const nftsList = await Moralis.Web3API.account.getNFTs({
      chain: ('0x' + chainId.toString(16)) as any,
      address,
      limit: LIMIT_QUERY_MORALIS,
      cursor: cursor,
    });

    return nftsList;
  }

  async addNewMolarisNFTs(nfts, user: User) {
    for (let nft of nfts) {
      const collectionAddress = nft.token_address;
      const tokenId = nft.token_id;
      const nftInDB = await this.getNFTByChainIdCollectionAddressAndTokenId(
        Number(nft.chainId),
        collectionAddress,
        Number(tokenId),
      );
      if (nftInDB) {
        nftInDB.isDraft = 0;
        await nftInDB.save();

        const allOldOwner = await this.ownerNftService.findAllOwnerByNFTId(
          nftInDB.id,
        );
        for (let i = 0; i < allOldOwner.length; i++) {
          allOldOwner[i].saleTotal = 0;
          await allOldOwner[i].save();
        }

        const ownerNFT = new OwnerNft();
        ownerNFT.saleTotal = 1;
        ownerNFT.farmTotal = 0;
        ownerNFT.user = user;
        ownerNFT.nfts = nftInDB;
        await ownerNFT.save();
      }
    }
  }

  async updateToOwnerNFTs(nfts, user: User) {
    for (let nft of nfts) {
      nft.isDraft = 0;
      await nft.save();
      const ownerNFT = await this.ownerNftService.findAllOwnerByNFTId(nft.id);
      for (let i = 0; i < ownerNFT.length; i++) {
        if (ownerNFT[i].user.id === user.id) {
          ownerNFT[i].saleTotal = 1;
        } else {
          ownerNFT[i].saleTotal = 0;
        }
        await ownerNFT[i].save();
      }
    }
  }

  async updateToOtherOwnerNFTs(nfts) {
    for (let nft of nfts) {
      // find owner on blockchain
      const contractAddress = nft.collections?.contractAddress;
      const tokenId = nft.tokenId;
      // const chainId = nft.collections?.network?.chainId;
      // const tokenIdOwners = await Moralis.Web3API.token.getTokenIdOwners({
      //   address: contractAddress,
      //   token_id: tokenId,
      //   chain: ('0x' + chainId.toString(16)) as any,
      // });
      // const currentOwnerAddress = tokenIdOwners.result[0].owner_of;
      const web3 = new Web3(nft?.collections?.network?.rpc);
      const contractInstance = new web3.eth.Contract(
        COLLECTION_ABI,
        contractAddress,
      );

      const currentOwnerAddress = await contractInstance.methods
      .ownerOf(tokenId)
      .call();

      const user = await this.userService.findUserByAddress(
        currentOwnerAddress,
      );

      if (user) {
        // if owner is on system => update to this owner
        await this.updateOwnerNFTToUser(nft, user);
      } else {
        // other => create owner => update owner to this owner
        const newUser = await this.userService.createNewUserWithAddress(currentOwnerAddress)
        await this.updateOwnerNFTToUser(nft, newUser);
      }
    }
  }

  async updateOwnerNFTToUser(nft, user) {
    const ownerNFT = await this.ownerNftService.findAllOwnerByNFTId(nft.id);
    let wasOwner = false;
    for (let i = 0; i < ownerNFT.length; i++) {
      if (ownerNFT[i].user.id === user.id) {
        ownerNFT[i].saleTotal = 1;
        wasOwner = true;
      } else {
        ownerNFT[i].saleTotal = 0;
      }
      await ownerNFT[i].save();
    }

    if (!wasOwner) {
      const ownerNFT = new OwnerNft();
      ownerNFT.saleTotal = 1;
      ownerNFT.farmTotal = 0;
      ownerNFT.user = user;
      ownerNFT.nfts = nft;
      await ownerNFT.save();
    }
  }

  async getNFTByChainIdCollectionAddressAndTokenId(
    chainId: number,
    collectionAddress: string,
    tokenId: number,
  ) {
    return this.nftsRepository
      .createQueryBuilder('nfts')
      .leftJoin(
        'collections',
        'collections',
        'collections.id = nfts.collections',
      )
      .leftJoin('networks', 'networks', 'networks.id = nfts.network')
      .where('collections.contractAddress = :collectionAddress', {
        collectionAddress,
      })
      .andWhere('networks.chainId = :chainId', {
        chainId,
      })
      .andWhere('nfts.tokenId = :tokenId', { tokenId })
      .getOne();
  }
}
