import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { getConnection, In } from 'typeorm';
import { NetworkService } from '../networks/network.service';
import { User } from '../users/entities/user.entity';
import { CollectionsRepository } from './collections.repository';
import { CACHE_TIME, CollectionKey, xanalia721 } from './constants';
import { CreateCollectionDto } from './dto/create-collection.dto';
import {
  CalculateUpDownVolume,
  CollectionSort,
  CollectionStatus,
  collectionType,
  FindCollectionVolumn,
} from './enums';
import { GetListCollectionDto } from './dto/get-list-collection.dto';
import { GetInfoCollectionDto } from './dto/get-info-collection';
import { NftsService } from '../nfts/nfts.service';
import { BlockchainsService } from '../blockchains/blockchains.service';
import { UpdateCollectionDto } from './dto/update-collection.dto';
import { getPagination } from 'src/common/utility/common.utility';
import { NftsRepository } from '../nfts/nfts.repository';
import { NetworkRepository } from '../networks/network.repository';
import { createClient } from 'redis';
import { GetHotCollectionsDto } from './dto/get-hot-collections.dto';
import {
  NftStatus,
  NFT_CATEGORIES,
  NFT_DURATION,
  NFT_MARKET_STATUS,
} from '../nfts/enums';
import { GetRankingCollectionsDto } from './dto/get-ranking-collections.dto';
import { UserRepository } from '../users/user.repository';
import { SaleNftStatus, SaleNftType } from '../sale-nft/const';
import { SaleNftRepository } from '../sale-nft/sale-nft.repository';
import { DetailCollectionDto } from './dto/detail-collection.dto';
import {
  NftInCollectionDto,
  NftOwnerCollectionDto,
} from './dto/nft-in-collection.dto';
import { OwnerNftRepository } from '../owner-nft/owner-nft.repository';
import { RateCoinService } from 'src/modules/rateCoins/rate-coin.service';
import moment from 'moment';
import { Pagination } from 'nestjs-typeorm-paginate';
import BigNumber from 'bignumber.js';
import { AuctionSessionService } from '../auction-session/auction-session.service';
import { CustomErrorMessage } from 'src/common/constants/error-message';
import { NetworkSupport } from '../networks/enums';
import { CollectionLaunchpadRepository } from './collection-launchpad.repository';

@Injectable()
export class CollectionsService {
  constructor(
    private readonly collectionsRepository: CollectionsRepository,
    private readonly collectionLaunchpadRepo: CollectionLaunchpadRepository,
    private readonly networkService: NetworkService,
    @Inject(forwardRef(() => NftsService))
    private nftService: NftsService,
    private nftRepository: NftsRepository,
    private readonly blockchainsService: BlockchainsService,
    private networkRepository: NetworkRepository,
    private userRepository: UserRepository,
    private saleNftRepository: SaleNftRepository,
    private readonly auctionSessionService: AuctionSessionService,
    private ownerNftRepository: OwnerNftRepository,
    private readonly rateCoinService: RateCoinService,
  ) {}

  async findOne(id: number) {
    const collection = await this.collectionsRepository.findOne({
      relations: ['network'],
      where: {
        id,
      },
    });

    if (!collection) {
      throw new NotFoundException(CustomErrorMessage['COLLECTIONS.NOT_FOUND']);
    }
    return collection;
  }

  async create(createCollectionDto: CreateCollectionDto, user: User) {
    const dataCreate = await createCollectionDto.toEntity(
      user,
      this.networkService,
    );
    const transaction = await this.blockchainsService.createCollection(
      dataCreate,
      user.userWallet,
    );
    // if (user.walletType === 0) {
    //   const signedTx: SignTransaction = transaction.signedTx;
    //   createCollectionDto.contractAddress = transaction.result.contractAddress;
    //   createCollectionDto.rawTransaction = signedTx.rawTransaction;
    //   createCollectionDto.hashTransaction = signedTx.transactionHash;
    //   if (transaction.result.status) {
    //     createCollectionDto.status = CollectionStatus.DONE;
    //   }
    //   // insert to transactions table
    //   await this.transactionRepository.insert({
    //     address: user.userWallet.address,
    //     signTransaction: signedTx,
    //     user,
    //     type: TransactionType.CollectionCreate,
    //     transactionHash: signedTx.transactionHash,
    //   });
    // }
    const savedCollection = await this.collectionsRepository.save(
      await createCollectionDto.toEntity(user, this.networkService),
    );
    console.log('-----------approve collection -------------');
    // await this.blockchainsService.addCollectionMarketContract(
    //   createCollectionDto.contractAddress,
    //   user.walletType,
    //   dataCreate.network,
    // );
    // if (user.walletType > 0) {
    return {
      dataReturn: transaction,
      // nonce: user.nonce,
      collection: savedCollection,
    };
    // }
    // return savedCollection;
  }

  async createWithXanalia721(user: User) {
    const networks = await this.networkService.findAll();
    const newCollections = [];
    networks.forEach(async (network) => {
      const createCollectionDto = new CreateCollectionDto();
      createCollectionDto.name = xanalia721.NAME;
      createCollectionDto.description = xanalia721.DESCRIPTION;
      createCollectionDto.image = xanalia721.IMAGE;
      createCollectionDto.contractAddress = network.xanalia721GeneralContract;
      createCollectionDto.status = CollectionStatus.DONE;
      createCollectionDto.type = collectionType.default;
      createCollectionDto.networkId = network.id;
      newCollections.push(
        this.collectionsRepository.insert(
          await createCollectionDto.toEntity(user, this.networkService),
        ),
      );
    });
    await Promise.all([newCollections]);
    return;
  }

  async update(
    id: number,
    updateCollectionDto: UpdateCollectionDto,
    user: User,
  ) {
    const { description, banner, image } = updateCollectionDto;
    const collection = await this.collectionsRepository.findOne(id);
    if (!collection) {
      throw new NotFoundException(CustomErrorMessage['COLLECTIONS.NOT_FOUND']);
    }
    if (collection.userId != user.id) {
      throw new NotFoundException(
        CustomErrorMessage[
          'VALIDATE_NFT.COLLECTION_DOES_NOT_BELONG_TO_THIS_USER'
        ],
      );
    }
    if (description !== undefined) {
      collection.description = description;
    }
    if (banner !== undefined) {
      collection.bannerImage = process.env.PUBLIC_IMAGE_URL_PREFIX + banner;
    }
    if (image !== undefined) {
      collection.iconImage = process.env.PUBLIC_IMAGE_URL_PREFIX + image;
    }
    return await collection.save();
  }

  async getMyCollection(networkId: number, userId: number) {
    const collectionData = await this.collectionsRepository.find({
      select: ['id', 'name'],
      where: [
        { networkId, userId: userId },
        { networkId, type: collectionType.default }
      ]
    });
    collectionData.map((item) => { delete (item.network); return item; })
    return { data: collectionData };
  }

  async getAllCollection(getListCollection: GetListCollectionDto, id: Number) {
    let { page, limit, networkId, status } = getListCollection;
    const subQuery = this.collectionsRepository
      .createQueryBuilder('c')
      .select(
        `COUNT(*) AS cnt, SUM(IF(nfts.market_status IN (${NFT_MARKET_STATUS.ON_FIX_PRICE} , ${NFT_MARKET_STATUS.ON_AUCTION}, ${NFT_MARKET_STATUS.IMCOMMING_AUCTION}), 1, 0)) AS total_on_sale, c.id`,
      )
      .leftJoin('nfts', 'nfts', 'c.id = nfts.collections_id')
      .where('nfts.is_draft = 0')
      .groupBy('c.id');

    const $query = this.collectionsRepository
      .createQueryBuilder('collection')
      .select([
        'collection.id as id',
        'collection.name as name',
        'collection.description as description',
        'collection.symbol as symbol',
        'collection.type as type',
        'collection.bannerImage as bannerImage',
        'collection.iconImage as iconImage',
        'collection.contractAddress as contractAddress',
        'collection.status as status',
        'collection.hashTransaction as hashTransaction',
        'collection.userId as userId',
        'collection.createdAt as createdAt',
        'collection.updatedAt as updatedAt',
        'collection.networkId as networkId',
        'cnt_nft.cnt AS totalNft',
        'cnt_nft.total_on_sale AS totalOnSale',
      ])
      .leftJoin(
        '(' + subQuery.getQuery() + ')',
        'cnt_nft',
        'cnt_nft.id = collection.id',
      )
      .leftJoin('collection.network', 'network')
      .leftJoin('collection.nfts', 'nfts')
      // .leftJoin('users', 'users', 'nfts.user_id = users.id')
      .andWhere('(collection.userId = :id or collection.type = :type)', {
        id: id,
        type: collectionType.default,
      })
      // .andWhere('users.id = :id', { id: id })
      .groupBy('collection.id');
    if (status || status == 0) {
      $query.andWhere('collection.status = :status', { status });
    }
    if (networkId) {
      $query.andWhere('collection.network_id = :networkId ', {
        networkId: networkId,
      });
    }
    if (limit && page) {
      $query
        .limit(limit)
        .offset((page - 1) * limit)
        .orderBy('collection.createdAt', 'DESC');
    }
    const [collections, totalItems] = await Promise.all([
      $query.getRawMany(),
      $query.getCount(),
    ]);
    const $query1 = this.networkRepository
      .createQueryBuilder('network')
      .select([
        'network.id as id',
        'network.name as name',
        'network.chainId as chainId',
        'network.marketContract as marketContract',
        'network.xanalia1155GeneralContract as xanalia1155GeneralContract',
        'network.xanalia721GeneralContract as xanalia721GeneralContract',
        'network.xanaliaDexContract as xanaliaDexContract',
        'network.xanaliaURIContract as xanaliaURIContract',
        'network.auctionContract as auctionContract',
        'network.rpc as rpc',
        'network.image as image',
        'network.gasLimit as gasLimit',
        'network.gasLimitCollection as gasLimitCollection',
        'network.gasPrice as gasPrice',
        'network.status as status',
        'network.createdAt as createdAt',
      ]);
    const networkArray = await $query1.getRawMany();

    for (let i = 0; i < collections.length; i++) {
      for (let j = 0; j < networkArray.length; j++) {
        if (collections[i].networkId == networkArray[j]['id']) {
          collections[i]['network'] = networkArray[j];
        }
      }
    }
    return getPagination(
      collections,
      totalItems,
      Math.ceil(totalItems / limit),
      page,
    );
  }

  async getHotCollection(getListCollection: GetHotCollectionsDto) {
    let { page, limit } = getListCollection;

    const conditionKey = `${CollectionKey.HOT_COLLECTION}-${page}-${limit}`;
    const cacheData = await this.getListCollectionsCache(conditionKey);

    if (cacheData) {
      return JSON.parse(cacheData);
    }

    const query = await this.collectionsRepository
      .createQueryBuilder('collections')
      .select([
        'collections.id as id',
        'collections.name as name',
        'collections.description as description',
        'collections.symbol as symbol',
        'collections.type as type',
        `IF (collections.iconImage IS NULL OR collections.iconImage = '', NULL, collections.iconImage) as iconImage`,
        `IF (collections.bannerImage IS NULL OR collections.bannerImage = '', NULL, collections.bannerImage) as bannerImage`,
        'collections.contractAddress as contractAddress',
        'collections.status as status',
        'collections.hashTransaction as hashTransaction',
        'collections.userId as userId',
        'users.userName as createdBy',
        'collections.networkId as networkId',
        'networks.name as network',
        'collections.createdAt as createdAt',
        'collections.updatedAt as updatedAt',
        `(SELECT COUNT(nfts.id) FROM nfts WHERE nfts.collections_id = collections.id AND nfts.market_status IN (${[
          NFT_MARKET_STATUS.ON_FIX_PRICE,
          NFT_MARKET_STATUS.ON_AUCTION,
          NFT_MARKET_STATUS.IMCOMMING_AUCTION,
        ].join(',')})) as totalNftOnSale`,
      ])
      .addSelect('COUNT(nfts.id ) as totaNft')
      .leftJoin('collections.nfts', 'nfts')
      .leftJoin('networks', 'networks', 'networks.id = collections.network')
      .leftJoin('users', 'users', 'users.id = collections.user')
      .andWhere('collections.status = :status', {
        status: CollectionStatus.DONE,
      })
      .groupBy('collections.id');

    query
      .orderBy('totalNftOnSale', 'DESC')
      .limit(limit)
      .offset(limit * (page - 1));

    const [list, count] = await Promise.all([
      query.getRawMany(),
      query.getCount(),
    ]);

    const response = {
      list,
      count,
    };

    await this.setListCollectionsCache(conditionKey, response);

    return response;
  }

  async getInfoCollection(getInfoCollection: GetInfoCollectionDto) {
    let { contractAddress } = getInfoCollection;
    const collection = this.collectionsRepository.findOne({
      relations: ['network'],
      where: {
        contractAddress: contractAddress,
      },
    });
    return collection;
  }

  async getCollectionWithNft(user: User) {
    const collections =
      await this.collectionsRepository.getListCollectionByUserId(user.id);
    return Promise.all(
      collections.map(async (collection) => {
        const nfts = await this.nftService.findAllNfts(collection);
        return {
          ...collection,
          nfts: nfts,
        };
      }),
    );
  }

  async getListCollections(
    pageIndex: number = 1,
    pageSize: number = 10,
    networkId: number,
    name: string,
  ) {
    try {
      const conditionKey = `${CollectionKey.LIST_COLLECTION}-${pageIndex}-${pageSize}-${networkId}-${name}`;
      const cacheData = await this.getListCollectionsCache(conditionKey);

      if (cacheData) {
        return JSON.parse(cacheData);
      }

      const query = await this.collectionsRepository
        .createQueryBuilder('collections')
        .select([
          'collections.id as id',
          'collections.name as name',
          'collections.description as description',
          'collections.symbol as symbol',
          'collections.type as type',
          'collections.iconImage as iconImage',
          'collections.bannerImage as bannerImage',
          'collections.contractAddress as contractAddress',
          'collections.status as status',
          'collections.hashTransaction as hashTransaction',
          'collections.userId as userId',
          'users.userName as createdBy',
          'collections.networkId as networkId',
          'networks.name as network',
          'collections.createdAt as createdAt',
          'collections.updatedAt as updatedAt',
        ])
        .addSelect('COUNT(nfts.id ) as totaNft')
        .leftJoin('collections.nfts', 'nfts')
        .leftJoin('networks', 'networks', 'networks.id = collections.network')
        .leftJoin('users', 'users', 'users.id = collections.user')
        .andWhere('collections.status = :status', {
          status: CollectionStatus.DONE,
        })
        .groupBy('collections.id');

      if (networkId) {
        query.andWhere('networks.id = :networkId', { networkId });
      }

      if (name) {
        query.andWhere('collections.name LIKE :name', { name: `%${name}%` });
      }

      query
        .orderBy('collections.createdAt', 'DESC')
        .limit(pageSize)
        .offset(pageSize * (pageIndex - 1));

      const [list, count] = await Promise.all([
        query.getRawMany(),
        query.getCount(),
      ]);

      const response = {
        list,
        count,
      };

      await this.setListCollectionsCache(conditionKey, response);

      return response;
    } catch (error) {
      console.log(error);
      return {
        code: 500,
        message: error.message,
      };
    }
  }

  handleSortRankingCollection(query, sort: CollectionSort, volumeSort) {
    const arrChangeVolume = [];
    switch (sort) {
      case CollectionSort.VOLUME_DESC:
        query.orderBy('volume = 0 OR volume IS NULL, volume', 'DESC');
        break;
      case CollectionSort.VOLUME_ASC:
        query.orderBy('volume = 0 OR volume IS NULL, volume', 'ASC');
        break;
      case CollectionSort.PRICE_CHANGE_DAY_DESC:
        for (const [key, value] of Object.entries(volumeSort['24H'])) {
          if (value && value['value'] !== 0) {
            arrChangeVolume.push({
              id: key,
              value: value,
            });
          }
        }
        if (arrChangeVolume.length > 0) {
          arrChangeVolume.sort((a, b) => a.value.value - b.value.value);
          query.orderBy(
            `FIELD(c.id, ${arrChangeVolume
              .map((x) => Number(x.id))
              .toString()})`,
            'DESC',
          );
        }
        break;
      case CollectionSort.PRICE_CHANGE_DAY_ASC:
        for (const [key, value] of Object.entries(volumeSort['24H'])) {
          if (value && value['value'] !== 0) {
            arrChangeVolume.push({
              id: key,
              value: value,
            });
          }
        }
        if (arrChangeVolume.length > 0) {
          arrChangeVolume.sort((a, b) => b.value.value - a.value.value);
          query.orderBy(
            `FIELD(c.id, ${arrChangeVolume
              .map((x) => Number(x.id))
              .toString()})`,
            'DESC',
          );
        }
        break;
      case CollectionSort.PRICE_CHANGE_WEEK_DESC:
        for (const [key, value] of Object.entries(volumeSort['7DAY'])) {
          if (value && value['value'] !== 0) {
            arrChangeVolume.push({
              id: key,
              value: value,
            });
          }
        }
        if (arrChangeVolume.length > 0) {
          arrChangeVolume.sort((a, b) => a.value.value - b.value.value);
          query.orderBy(
            `FIELD(c.id, ${arrChangeVolume
              .map((x) => Number(x.id))
              .toString()})`,
            'DESC',
          );
        }
        break;
      case CollectionSort.PRICE_CHANGE_WEEK_ASC:
        for (const [key, value] of Object.entries(volumeSort['7DAY'])) {
          if (value && value['value'] !== 0) {
            arrChangeVolume.push({
              id: key,
              value: value,
            });
          }
        }
        if (arrChangeVolume.length > 0) {
          arrChangeVolume.sort((a, b) => b.value.value - a.value.value);
          query.orderBy(
            `FIELD(c.id, ${arrChangeVolume
              .map((x) => Number(x.id))
              .toString()})`,
            'DESC',
          );
        }
        break;
      case CollectionSort.FLOOR_DESC:
        query.orderBy(
          'floorPrice = 0 OR floorPrice IS NULL, floorPrice',
          'DESC',
        );
        break;
      case CollectionSort.FLOOR_ASC:
        query.orderBy(
          'floorPrice = 0 OR floorPrice IS NULL, floorPrice',
          'ASC',
        );
        break;
      case CollectionSort.OWNERS_DESC:
        query.orderBy('owners = 0, owners', 'DESC');
        break;
      case CollectionSort.OWNERS_ASC:
        query.orderBy('owners = 0, owners', 'ASC');
        break;
      case CollectionSort.ITEMS_DESC:
        query.orderBy('items = 0, items', 'DESC');
        break;
      case CollectionSort.ITEMS_ASC:
        query.orderBy('items = 0, items', 'ASC');
        break;
      default:
        query.orderBy('volume = 0 OR volume IS NULL, volume', 'DESC');
    }
    return query;
  }

  async getRankingCollection(options: GetRankingCollectionsDto) {
    let volumeSort;
    if (
      [
        CollectionSort.PRICE_CHANGE_DAY_DESC,
        CollectionSort.PRICE_CHANGE_DAY_ASC,
        CollectionSort.PRICE_CHANGE_WEEK_DESC,
        CollectionSort.PRICE_CHANGE_WEEK_ASC,
      ].includes(options.sort)
    ) {
      volumeSort = await this.getVolumeChangeByCollections();
    }

    let dateDuration;
    if (options.duration == NFT_DURATION.DAY) {
      dateDuration = moment().subtract(1, 'd').toISOString(true);
    } else if (options.duration == NFT_DURATION.WEEK) {
      dateDuration = moment().subtract(7, 'd').toISOString(true);
    } else if (options.duration == NFT_DURATION.MONTH) {
      dateDuration = moment().subtract(30, 'd').toISOString(true);
    }

    const exchangeRates =
      await this.rateCoinService.getExchangeRateByNetworkTokens('ETH');

    let selectByReceiveToken = '';
    exchangeRates.forEach((exchangeRate) => {
      selectByReceiveToken += ` WHEN '${exchangeRate.from_coin}' THEN sf.price * ${exchangeRate.exchange_rate}`;
    });
    selectByReceiveToken = dateDuration
      ? `(IF(sf.createdAt >= '${dateDuration}', (CASE sf.receiveToken ${selectByReceiveToken} else sf.price END), 0))`
      : `(CASE sf.receiveToken ${selectByReceiveToken} else sf.price END)`;

    const selectReceiveWithCheckAction = `(IF(sf.action IN (${SaleNftType.BUY_NFT}, ${SaleNftType.ACCEPT_NFT}, ${SaleNftType.ACCEPT_BID_NFT}), ${selectByReceiveToken}, NULL))`;
    const query = this.collectionsRepository
      .createQueryBuilder('c')
      .select([
        'c.id as collection_id',
        'c.name as collection_name',
        'c.contract_address as collection_contract_address',
        'nw.id as collection_network_id',
        'nw.name as collection_network_name',
        `IF (c.icon_image IS NULL OR c.icon_image = '', NULL, c.icon_image) as iconImage`,
        `IF (c.banner_image IS NULL OR c.banner_image = '', NULL, c.banner_image) as bannerImage`,
        `ROUND(MIN${selectReceiveWithCheckAction}, 6) as floorPrice`,
        `ROUND(SUM(sf.quantity * ${selectReceiveWithCheckAction}), 6) as volume`,
        'COUNT(DISTINCT n.id) as items',
        'COUNT(DISTINCT o.user_id) as owners',
      ])
      .leftJoin('c.nfts', 'n')
      .leftJoin('c.network', 'nw')
      .leftJoin('n.ownerNfts', 'o', 'o.sale_total > 0')
      .leftJoin('n.saleNft', 'sf')
      .where('n.status = :status', { status: NftStatus.DONE })
      .andWhere('c.status = :status', { status: CollectionStatus.DONE })
      .andWhere('sf.status = :status', { status: SaleNftStatus.SUCCESS });

    if (options.chain == NetworkSupport.ETH) {
      query.andWhere('c.network_id = :networkId', {
        networkId: NetworkSupport.ETH,
      });
    } else if (options.chain == NetworkSupport.POLYGON) {
      query.andWhere('c.network_id = :networkId', {
        networkId: NetworkSupport.POLYGON,
      });
    } else if (options.chain == NetworkSupport.BSC) {
      query.andWhere('c.network_id = :networkId', {
        networkId: NetworkSupport.BSC,
      });
    }

    query.groupBy('c.id');

    const queryResult = this.handleSortRankingCollection(
      query,
      options.sort,
      volumeSort,
    );

    const [queryString, params] = queryResult.getQueryAndParameters();
    const count = getConnection()
      .query(`SELECT COUNT(*) AS count FROM (${queryString}) a`, params)
      .then((result) => {
        return result[0];
      });

    queryResult.limit(options.limit).offset((options.page - 1) * options.limit);

    const [data, total] = await Promise.all([queryResult.getRawMany(), count]);

    const totalItems = Number(total.count);

    if (data && data.length > 0) {
      const volumeChanged = volumeSort
        ? volumeSort
        : await this.getVolumeChangeByCollections(
            data.map((x) => Number(x.collection_id)),
          );

      data.forEach((item) => {
        item.priceChanged24h =
          volumeChanged[CalculateUpDownVolume['24H']][item.collection_id]
            ?.code || '0';
        item.priceChanged7day =
          volumeChanged[CalculateUpDownVolume['7DAY']][item.collection_id]
            ?.code || '0';
      });
    }

    return new Pagination<any>(data, {
      itemCount: data.length,
      totalItems: totalItems,
      currentPage: options.page,
      itemsPerPage: options.limit,
      totalPages: Math.ceil(totalItems / options.limit),
    });
  }

  async getVolumeChangeByCollections(collectionIds?: number[]) {
    const exchangeRates =
      await this.rateCoinService.getExchangeRateByNetworkTokens('ETH');

    let selectByReceiveToken = '';
    exchangeRates.forEach((exchangeRate) => {
      selectByReceiveToken += ` WHEN '${exchangeRate.from_coin}' THEN sf.price * ${exchangeRate.exchange_rate}`;
    });
    selectByReceiveToken = `(CASE sf.receiveToken ${selectByReceiveToken} else sf.price END)`;

    const lastOneDay = moment().subtract(1, 'd').toISOString(true);
    const lastTwoDay = moment().subtract(2, 'd').toISOString(true);
    const lastSevenDay = moment().subtract(7, 'd').toISOString(true);
    const lastTwoweeks = moment().subtract(14, 'd').toISOString(true);

    const q = [];
    for (const property in FindCollectionVolumn) {
      const query = this.collectionsRepository
        .createQueryBuilder('c')
        .select([
          `c.id as collection_id`,
          `ROUND(SUM(sf.quantity * ${selectByReceiveToken}), 6) as volume`,
        ])
        .leftJoin('c.nfts', 'n')
        .leftJoin('n.saleNft', 'sf')
        .where('n.status = :status', { status: NftStatus.DONE })
        .andWhere('c.status = :status', { status: CollectionStatus.DONE })
        .andWhere('sf.status = :status', { status: SaleNftStatus.SUCCESS })
        .andWhere('sf.action IN (:action)', {
          action: [
            SaleNftType.BUY_NFT,
            SaleNftType.ACCEPT_NFT,
            SaleNftType.ACCEPT_BID_NFT,
          ],
        });
      if (collectionIds && collectionIds.length > 0) {
        query.andWhere('c.id IN (:collectionIds)', { collectionIds });
      }

      switch (FindCollectionVolumn[property]) {
        case FindCollectionVolumn.LAST_ONE_DAY:
          query.andWhere('sf.createdAt >= :lastOneDay', {
            lastOneDay: lastOneDay,
          });
          break;
        case FindCollectionVolumn.LAST_TWO_DAY:
          query
            .andWhere('sf.createdAt < :lastOneDay', {
              lastOneDay,
            })
            .andWhere('sf.createdAt >= :lastTwoDay', {
              lastTwoDay,
            });
          break;
        case FindCollectionVolumn.LAST_SEVEN_DAY:
          query.andWhere('sf.createdAt >= :lastSevenDay', {
            lastSevenDay,
          });
          break;
        case FindCollectionVolumn.LAST_TWO_WEEKS:
          query
            .andWhere('sf.createdAt < :lastSevenDay', {
              lastSevenDay,
            })
            .andWhere('sf.createdAt >= :lastTwoweeks', {
              lastTwoweeks,
            });
          break;
      }

      q.push(query.groupBy('c.id').getRawMany());
    }

    const [dataLastOneDay, dataLastTwoDay, dataSevenDay, dataTwoWeeks] =
      await Promise.all(q);

    const result = {};
    result[CalculateUpDownVolume['24H']] = {};
    result[CalculateUpDownVolume['7DAY']] = {};

    for (const rule in CalculateUpDownVolume) {
      const currentPriceArr =
        CalculateUpDownVolume[rule] === CalculateUpDownVolume['24H']
          ? dataLastOneDay
          : dataSevenDay;
      const lastPriceArr =
        CalculateUpDownVolume[rule] === CalculateUpDownVolume['24H']
          ? dataLastTwoDay
          : dataTwoWeeks;

      currentPriceArr.forEach((collection) => {
        const lastItem = lastPriceArr.find(
          (lastCollection) =>
            lastCollection.collection_id === collection.collection_id,
        );

        if (
          !lastItem ||
          !collection.volume ||
          !lastItem.volume ||
          Number(collection.volume) === 0 ||
          Number(lastItem.volume) === 0
        ) {
          result[CalculateUpDownVolume[rule]][collection.collection_id] = {
            value: 0,
            code: '0',
          };
        } else {
          const currentPrice = new BigNumber(collection.volume);
          const lastPrice = new BigNumber(lastItem.volume);

          const rate = (
            100 * currentPrice.minus(lastPrice).dividedBy(lastPrice).toNumber()
          ).toFixed(2);

          let rateString: string;

          if (Number(rate) > 0) {
            rateString = '+' + rate.toString();
          } else if (Number(rate) === 0) {
            rateString = '0';
          } else {
            rateString = rate.toString();
          }
          result[CalculateUpDownVolume[rule]][collection.collection_id] = {
            value: Number(rate),
            code: rateString,
          };
        }
      });
    }

    return result;
  }

  async connectRedis() {
    const client = createClient({
      url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
    });
    await client.connect();
    return client;
  }

  async getListCollectionsCache(key: string) {
    const clientRedis = await this.connectRedis();
    return await clientRedis.get(key);
  }

  async setListCollectionsCache(key: string, data: any) {
    const clientRedis = await this.connectRedis();
    return await clientRedis.set(key, JSON.stringify(data), { EX: CACHE_TIME });
  }

  async getCollectionReferData(listColelction) {
    if (!listColelction || !listColelction.length) {
      return;
    }

    for (let item of listColelction) {
      const networkNft = this.networkRepository
        .createQueryBuilder('networks')
        .select([
          'networks.name as networkName',
          'networks.id as networkId',
          'networks.image as avatar',
        ])
        .leftJoin('nfts', 'nfts', 'networks.id = nfts.network')
        .andWhere('nfts.id = :nftId', { nftId: item.nftId });

      const creatorNft = this.collectionsRepository
        .createQueryBuilder('collections')
        .select([
          'users.id as userId',
          'users.avatar as avatar',
          'users.userName as name',
          '(select uw.address from `user-wallet` uw where uw.id = users.userWallet) as address',
        ])
        .leftJoin('users', 'users', 'users.id = collections.user')
        .andWhere('collections.id = :collectionId', { collectionId: item.id });

      const [network, creator] = await Promise.all([
        networkNft.getRawOne(),
        creatorNft.getRawOne(),
      ]);

      item['network'] = network;
      item['creator'] = creator;

      // todo get total nft value by eth
      item.totalNftValue = 100;
    }

    return listColelction;
  }

  async getCollectionAllUser(listCollectionAllUser: GetHotCollectionsDto, isHotCollection: number = 0) {
    let { page, limit } = listCollectionAllUser;
    try {
      const { collectionQuery, userQuery, networkQuery } =
        this.getQueryCollectionUser();

      collectionQuery.limit(limit).offset((page - 1) * limit);
      if (isHotCollection) {
        collectionQuery.andWhere('c.isHot = 1')
      }

      const [listCollectionPaginated, total] = await Promise.all([collectionQuery.getRawMany(), collectionQuery.getCount()]);
      const listOwnerId = listCollectionPaginated.map((collecion) => { return collecion.userId; });

      const [owners, networks] =
        await Promise.all([
          userQuery.andWhere('u.id IN (:listOwnerId)', { listOwnerId }).getRawMany(),
          networkQuery.getRawMany(),
        ]);

      listCollectionPaginated.map((collecion) => {
        owners.map((owner) => {
          if (collecion.userId == owner.userId) {
            collecion['owner'] = owner;
          }
        });

        networks.map((network) => {
          if (collecion.networkId == network.networkId) {
            collecion['network'] = network;
          }
        });
      });

      return { listCollectionAllUser: listCollectionPaginated, count: total };
    } catch (error) {
      console.log(error);
    }
  }

  getQueryCollectionUser() {
    const subQuery = this.collectionsRepository
      .createQueryBuilder('c')
      .select(
        `COUNT(*) AS cnt, SUM(IF(nfts.market_status IN (${NFT_MARKET_STATUS.ON_FIX_PRICE} , ${NFT_MARKET_STATUS.ON_AUCTION}, ${NFT_MARKET_STATUS.IMCOMMING_AUCTION}), 1, 0)) AS total_on_sale, c.id as id`,
      )
      .leftJoin('nfts', 'nfts', 'c.id = nfts.collections_id')
      .where('nfts.is_draft = 0')
      .groupBy('c.id');

    const collectionQuery = this.collectionsRepository
      .createQueryBuilder('c')
      .select([
        'c.id as id',
        'c.name as name',
        'c.description as description',
        'c.symbol as symbol',
        'c.type as type',
        'c.bannerImage as bannerImage',
        'c.iconImage as iconImage',
        'c.contractAddress as contractAddress',
        'c.status as status',
        'c.hashTransaction as hashTransaction',
        'c.networkId as networkId',
        'c.userId as userId',
        'c.createdAt as createdAt',
        'c.updatedAt as updatedAt',
        'c.isHot as isHot',
        'cnt_nft.cnt AS totalNft',
        'cnt_nft.total_on_sale AS totalOnSale',
      ])
      .leftJoin('(' + subQuery.getQuery() + ')', 'cnt_nft', 'cnt_nft.id = c.id')
      .where(`c.status = ${CollectionStatus.DONE}`)
      .orderBy('c.createdAt', 'DESC');

    const userQuery = this.userRepository
      .createQueryBuilder('u')
      .select([
        'u.id as userId',
        'u.userName as name',
        'u.avatar as avatar',
        'u.description as description',
        'uw.address as address',
      ])
      .leftJoin('u.userWallet', 'uw');

    const networkQuery = this.networkRepository
      .createQueryBuilder('n')
      .select([
        'n.name as networkName',
        'n.id as networkId',
        'n.image as image',
      ])

    return { collectionQuery, userQuery, networkQuery };
  }

  async getDetailOfCollection(detailCollectionDto: DetailCollectionDto) {
    let { networkName, contractAddress } = detailCollectionDto;
    const collectionData = await this.collectionsRepository.find({
      select: ['id', 'name', 'symbol', 'contractAddress', 'type', 'description', 'bannerImage', 'iconImage', 'userId', 'network'],
      relations: ['network'],
      where: { contractAddress: contractAddress, network: { name: networkName } }
    });
    let collection = collectionData[0];
    let result = {
      id: collection.id,
      name: collection.name,
      symbol: collection.symbol,
      type: collection.type,
      contractAddress: collection.contractAddress,
      description: collection.description,
      bannerImage: collection.bannerImage,
      iconImage: collection.iconImage,
      userId: collection.userId,
      network: {
        networkId: collection.network.id,
        networkName: collection.network.name,
        image: collection.network.image,
      }
    }
    if (detailCollectionDto.isUpdate) {
      return result;
    }
    let totalNft = await this.nftRepository.count({ where: { status: NftStatus.DONE, isDraft: 0, collections: {id: collection.id} } });
    result['totalNft'] = totalNft;
    let totalOwner = await this.ownerNftRepository.createQueryBuilder('ow')
      .select(['COUNT(DISTINCT(user_id)) as cnt'])
      .where(`nfts_id IN (SELECT id FROM nfts WHERE collections_id = ${collection.id})`)
      .andWhere('sale_total > 0')
      .getRawOne();
    result['totalOwner'] = Number(totalOwner.cnt);

    const exchangeRates = await this.rateCoinService.getExchangeRateByNetworkTokens('ETH');
    let selectByReceiveToken = '';
    exchangeRates.forEach((exchangeRate) => {
      selectByReceiveToken += ` WHEN '${exchangeRate.from_coin}' THEN sf.price * ${exchangeRate.exchange_rate}`;
    });
    selectByReceiveToken = `(CASE sf.receiveToken ${selectByReceiveToken} else sf.price END)`;

    const selectReceiveWithCheckAction = `(IF(sf.action IN (${SaleNftType.BUY_NFT}, ${SaleNftType.ACCEPT_NFT}, ${SaleNftType.ACCEPT_BID_NFT}), ${selectByReceiveToken}, NULL))`;

    let tradedInfo = await this.saleNftRepository.createQueryBuilder('sf')
      .select([
        `ROUND(MIN${selectReceiveWithCheckAction}, 6) as floorPrice`,
        `ROUND(SUM(sf.quantity * ${selectReceiveWithCheckAction}), 6) as volumeTraded`
      ])
      .where(`nft_id IN (SELECT id FROM nfts WHERE collections_id = ${collection.id})`)
      .getRawOne();
    result['floorPrice'] = tradedInfo.floorPrice ?? 0;
    result['volumeTraded'] = tradedInfo.volumeTraded ?? 0;

    return result;
  }

  async getCollectionById(detailCollectionDto: DetailCollectionDto) {
    let { networkName, contractAddress } = detailCollectionDto;

    const exchangeRates =
      await this.rateCoinService.getExchangeRateByNetworkTokens('ETH');

    let selectByReceiveToken = '';
    exchangeRates.forEach((exchangeRate) => {
      selectByReceiveToken += ` WHEN '${exchangeRate.from_coin}' THEN sf.price * ${exchangeRate.exchange_rate}`;
    });
    selectByReceiveToken = `(CASE sf.receiveToken ${selectByReceiveToken} else sf.price END)`;

    const selectReceiveWithCheckAction = `(IF(sf.action IN (${SaleNftType.BUY_NFT}, ${SaleNftType.ACCEPT_NFT}, ${SaleNftType.ACCEPT_BID_NFT}), ${selectByReceiveToken}, NULL))`;

    const subQuery = this.collectionsRepository
      .createQueryBuilder('c')
      .select(
        `COUNT(*) AS cnt, SUM(IF(nfts.market_status IN (${NFT_MARKET_STATUS.ON_FIX_PRICE} , ${NFT_MARKET_STATUS.ON_AUCTION}, ${NFT_MARKET_STATUS.IMCOMMING_AUCTION}), 1, 0)) AS total_on_sale, c.id`,
      )
      .leftJoin('nfts', 'nfts', 'c.id = nfts.collections_id')
      .where('nfts.is_draft = 0')
      .groupBy('c.id');

    const query = this.collectionsRepository
      .createQueryBuilder('c')
      .select([
        'c.id as id',
        'c.name as name',
        'c.description as description',
        'c.contract_address as contractAddress',
        'c.created_at as createdAt',
        'c.updated_at as updatedAt',
        'c.hash_transaction as hashTransaction',
        'c.status as status',
        'c.symbol as symbol',
        'c.type as type',
        'c.is_blindbox as isBlindbox',
        'nw.id as collection_network_id',
        'nw.name as collection_network_name',
        'nw.image as collection_network_image',
        'u.id as collection_user_id',
        'u.user_name as collection_user_name',
        'u.description as collection_user_description',
        'uw.address as collection_user_address',
        `IF (u.avatar IS NULL OR u.avatar = '', NULL, u.avatar) as collection_user_avatar`,
        `IF (c.icon_image IS NULL OR c.icon_image = '', NULL, c.icon_image) as iconImage`,
        `IF (c.banner_image IS NULL OR c.banner_image = '', NULL, c.banner_image) as bannerImage`,
        `ROUND(MIN${selectReceiveWithCheckAction}, 6) as floorPrice`,
        `ROUND(SUM(sf.quantity * ${selectReceiveWithCheckAction}), 6) as volumeTraded`,
        'COUNT(DISTINCT n.id) as totalNft',
        'COUNT(DISTINCT o.user_id) as totalOwner',
        'cnt_nft.total_on_sale AS totalOnSale',
      ])
      .leftJoin('c.nfts', 'n')
      .leftJoin('c.user', 'u')
      .leftJoin('u.userWallet', 'uw')
      .leftJoin('c.network', 'nw')
      .leftJoin('n.ownerNfts', 'o', 'o.sale_total > 0')
      .leftJoin('n.saleNft', 'sf')
      .leftJoin('(' + subQuery.getQuery() + ')', 'cnt_nft', 'cnt_nft.id = c.id')
      .where('n.status = :status', { status: NftStatus.DONE })
      .andWhere('c.status = :status', { status: CollectionStatus.DONE })
      .andWhere('c.contract_address = :contractAddress', { contractAddress })
      .andWhere('sf.status = :status', { status: SaleNftStatus.SUCCESS })
      .andWhere('nw.name = :networkName', { networkName })
      .groupBy('c.id');

    let result = await query.getRawOne();

    if (!result) {
      const queryBase = this.collectionsRepository
        .createQueryBuilder('c')
        .select([
          'c.id as id',
          'c.name as name',
          'c.description as description',
          'c.contract_address as contractAddress',
          'c.created_at as createdAt',
          'c.updated_at as updatedAt',
          'c.hash_transaction as hashTransaction',
          'c.status as status',
          'c.symbol as symbol',
          'c.type as type',
          'c.is_blindbox as isBlindbox',
          'nw.id as collection_network_id',
          'nw.name as collection_network_name',
          'nw.image as collection_network_image',
          'u.id as collection_user_id',
          'u.user_name as collection_user_name',
          'u.description as collection_user_description',
          'uw.address as collection_user_address',
          `IF (u.avatar IS NULL OR u.avatar = '', NULL, u.avatar) as collection_user_avatar`,
          `IF (c.icon_image IS NULL OR c.icon_image = '', NULL, c.icon_image) as iconImage`,
          `IF (c.banner_image IS NULL OR c.banner_image = '', NULL, c.banner_image) as bannerImage`,
        ])
        .leftJoin('c.user', 'u')
        .leftJoin('c.network', 'nw')
        .leftJoin('u.userWallet', 'uw')
        .where('c.status = :status', { status: CollectionStatus.DONE })
        .andWhere('c.contract_address = :contractAddress', { contractAddress })
        .andWhere('nw.name = :networkName', { networkName });
      result = await queryBase.getRawOne();
      result = {
        ...result,
        ...{
          floorPrice: 0,
          volumeTraded: 0,
          totalNft: 0,
          totalOwner: 0,
          totalOnSale: 0,
        },
      };
    }

    result.network = {
      image: result.collection_network_image,
      networkId: result.collection_network_id,
      networkName: result.collection_network_name,
    };

    result.user = {
      address: result.collection_user_address,
      avatar: result.collection_user_avatar,
      description: result.collection_user_description,
      name: result.collection_user_name,
      userId: result.collection_user_id,
    };
    [
      'collection_network_image',
      'collection_network_id',
      'collection_network_name',
      'collection_user_address',
      'collection_user_avatar',
      'collection_user_description',
      'collection_user_name',
      'collection_user_id',
    ].forEach((e) => delete result[e]);
    return result;
  }

  async getNftsByCollectionId(
    nftInCollectionDto: NftInCollectionDto,
    userAddress?: string,
  ) {
    let { contractAddress, networkName, limit, page, status } =
      nftInCollectionDto;
    const findNetwork = await this.networkRepository.findOne({
      where: {
        name: networkName,
      },
    });
    const findCollection = await this.collectionsRepository.findOne({
      relations: ['network'],
      where: {
        contractAddress,
        network: {
          id: findNetwork.id,
        },
      },
    });

    const nftQuery = this.nftRepository
      .createQueryBuilder('n')
      .select([
        'n.id as nftId',
        'n.tokenId as tokenId',
        `CASE WHEN n.category IN (${NFT_CATEGORIES.VIDEO}, ${NFT_CATEGORIES.AUDIO}) THEN n.previewImage ELSE n.smallImage END as mediaUrl `,
        'n.name as name',
        'n.receiveToken as receiveToken',
        'n.status as status',
        'n.marketStatus as marketNftStatus',
        'n.isDraft as isDraft',
        'n.user as userId',
        'n.collections as colletionId',
        'n.category as category',
        '(SELECT COUNT(*) FROM user_like_nft uln WHERE uln.nft_id = n.id AND uln.status = 1) as totalLike',
      ])
      .addSelect(
        '(SELECT sale_nft.price from sale_nft where sale_nft.nft_id = n.id order by id DESC Limit 1) as price',
      )
      .where(`n.collections = ${findCollection.id}`)
      .andWhere('n.isDraft = 0')
      .limit(limit)
      .offset((page - 1) * limit);

    const creatorNft = this.nftRepository
      .createQueryBuilder('nfts')
      .select([
        'users.id as userId',
        'users.about as description',
        'users.avatar as avatar',
        'users.userName as name',
        'users.facebookSite as facebookLink',
        'users.instagramSite as instagramLink',
        'users.twitterSite as twitterLink',
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
        'collections.id as collectionId',
      ])
      .leftJoin('nfts', 'nfts', 'collections.id = nfts.collections')
      .where(`collections.id = ${findCollection.id}`);

    if (userAddress) {
      const user = await this.userRepository.findByUserAddress(userAddress);
      nftQuery.andWhere('n.user = :userId', { userId: user.id });
    } else {
      switch (+status) {
        case 1:
          nftQuery.andWhere(`n.marketStatus IN (
                ${NFT_MARKET_STATUS.ON_FIX_PRICE},
                ${NFT_MARKET_STATUS.ON_AUCTION},
                ${NFT_MARKET_STATUS.IMCOMMING_AUCTION},
                ${NFT_MARKET_STATUS.END_AUCTION}
               )`);
          break;
        case 2:
          nftQuery.andWhere(
            `n.marketStatus = ${NFT_MARKET_STATUS.NOT_ON_SALE}`,
          );
          break;
        case 3:
          break;
        default:
          throw new Error("Can't not get nft");
      }
    }
    let [list, count, creator, collection] = await Promise.all([
      nftQuery.getRawMany(),
      nftQuery.getCount(),
      creatorNft.getRawMany(),
      collectionNft.getRawMany(),
    ]);

    if (!list.length) {
      return { list: [], count: 0 };
    }

    const nftIds = list.map((nft) => {
      return nft.nftId;
    });

    const owners = await this.ownerNftRepository
      .createQueryBuilder('owner')
      .select([
        'users.id as userId',
        'users.user_name as name',
        'users.avatar as avatar',
        'userWallet.address as address',
        'owner.nfts_id as nftId',
      ])
      .where('owner.sale_total > 0')
      .andWhere(`owner.nfts_id in (${nftIds.join(',')})`)
      .leftJoin('users', 'users', 'owner.user_id = users.id')
      .leftJoin(
        'user-wallet',
        'userWallet',
        'userWallet.id = users.user_wallet_id',
      )
      .getRawMany();

    await Promise.all(
      list.map(async (nft) => {
        nft.network = {
          networkName: findCollection.network.name,
          avatar: findCollection.network.image,
        };
        nft['owner'] =
          owners.find((owner) => {
            return owner.nftId == nft.nftId;
          }) || null;
        nft['creator'] =
          creator.find((creator) => {
            return creator.userId == nft.userId;
          }) || null;
        nft['collection'] =
          collection.find((collection) => {
            return collection.collecionId == nft.collecionId;
          }) || null;
        nft['saleData'] = {
          fixPrice: null,
          auction: null,
        };
        if (nft.marketNftStatus == NFT_MARKET_STATUS.ON_FIX_PRICE) {
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
            .where('sn.nft = :id', { id: nft.nftId })
            .andWhere('sn.status = :status', { status: SaleNftStatus.SUCCESS })
            .andWhere('sn.action = :action', {
              action: SaleNftType.PUT_ON_SALE,
            })
            .andWhere('sn.fromUser = :fromUser', {
              fromUser: nft.owner.userId,
            })
            .getRawOne();
          nft['saleData'].fixPrice = putOnSales;
          nft.tokenPriceIcon = putOnSales ? putOnSales.tokenPriceIcon : '';
        }

        if (
          [
            NFT_MARKET_STATUS.IMCOMMING_AUCTION,
            NFT_MARKET_STATUS.ON_AUCTION,
            NFT_MARKET_STATUS.END_AUCTION,
            NFT_MARKET_STATUS.CANCEL_AUCTION,
          ].includes(nft.marketNftStatus)
        ) {
          let actionSaleNft;
          let status;
          switch (nft.marketNftStatus) {
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
            .where('sn.nft = :id', { id: nft.nftId })
            .andWhere('sn.status = :status', { status: status })
            .andWhere(`sn.action = ${actionSaleNft}`)
            .andWhere(`sn.fromUser = ${nft.owner.userId}`)
            // .orderBy('sn.id', 'DESC')
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

          nft['saleData'].auction = auction;
        }
        return nft;
      }),
    );
    if (nftInCollectionDto.userId) {
      list = await this.nftService.attackIsLikeData(
        nftInCollectionDto.userId,
        list,
      );
    }

    return { list, count };
  }

  async getNftsOwnerByCollectionId(nftInCollectionDto: NftOwnerCollectionDto) {
    let { contractAddress, networkName, limit, page, userAddress } =
      nftInCollectionDto;
    if (!userAddress) {
      return [];
    }

    const findNetwork = await this.networkRepository.findOne({
      where: {
        name: networkName,
      },
    });
    const findCollection = await this.collectionsRepository.findOne({
      relations: ['network', 'user'],
      where: {
        contractAddress,
        network: {
          id: findNetwork.id,
        },
        // user: {
        //   userWallet: { address: userAddress },
        // },
      },
    });
    const nftQuery = this.nftRepository
      .createQueryBuilder('n')
      .select([
        'n.id as nftId',
        'n.tokenId as tokenId',
        `CASE WHEN n.category IN (${NFT_CATEGORIES.VIDEO}, ${NFT_CATEGORIES.AUDIO}) THEN n.previewImage ELSE n.smallImage END as mediaUrl `,
        'n.name as name',
        'n.receiveToken as receiveToken',
        'n.status as status',
        'n.marketStatus as marketNftStatus',
        'n.isDraft as isDraft',
        'n.user as userId',
        'n.collections as colletionId',
        '(SELECT COUNT(*) FROM user_like_nft uln WHERE uln.nft_id = n.id AND uln.status = 1) as totalLike',
      ])
      .addSelect(
        '(SELECT sale_nft.price from sale_nft where sale_nft.nft_id = n.id order by id DESC Limit 1) as price',
      )
      .leftJoin('owner_nft', 'own', 'own.nfts_id = n.id')
      .where(`n.collections = ${findCollection.id}`)
      .andWhere('n.isDraft = 0')
      .limit(limit)
      .offset((page - 1) * limit);
    const creatorNft = this.nftRepository
      .createQueryBuilder('nfts')
      .select([
        'users.id as userId',
        'users.about as description',
        'users.avatar as avatar',
        'users.userName as name',
        'users.facebookSite as facebookLink',
        'users.instagramSite as instagramLink',
        'users.twitterSite as twitterLink',
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
        'collections.id as collectionId',
      ])
      .leftJoin('nfts', 'nfts', 'collections.id = nfts.collections')
      .where(`collections.id = ${findCollection.id}`);

    if (userAddress) {
      const user = await this.userRepository.findByUserAddress(userAddress);
      nftQuery.andWhere('own.user = :userId', { userId: user?.id || null });
      nftQuery.andWhere('own.sale_total = 1');
      if (!user) {
        return [];
      }
    }
    const [list, count, creator, collection] = await Promise.all([
      nftQuery.getRawMany(),
      nftQuery.getCount(),
      creatorNft.getRawMany(),
      collectionNft.getRawMany(),
    ]);
    if (!list.length) {
      return { list: [], count: 0 };
    }

    const nftIds = list.map((nft) => {
      return nft.nftId;
    });

    const owners = await this.ownerNftRepository
      .createQueryBuilder('owner')
      .select([
        'users.id as userId',
        'users.user_name as name',
        'users.avatar as avatar',
        'userWallet.address as address',
        'owner.nfts_id as nftId',
      ])
      .where('owner.sale_total = 1')
      .andWhere(`owner.nfts_id in (${nftIds.join(',')})`)
      .leftJoin('users', 'users', 'owner.user_id = users.id')
      .leftJoin(
        'user-wallet',
        'userWallet',
        'userWallet.id = users.user_wallet_id',
      )
      .getRawMany();
    await Promise.all(
      list.map(async (nft) => {
        nft.network = {
          networkName: findCollection.network.name,
          avatar: findCollection.network.image,
        };
        nft['owner'] =
          owners.find((owner) => {
            return owner.nftId == nft.nftId;
          }) || null;
        nft['creator'] =
          creator.find((creator) => {
            return creator.userId == nft.userId;
          }) || null;
        nft['collection'] =
          collection.find((collection) => {
            return collection.collecionId == nft.collecionId;
          }) || null;
        nft['saleData'] = {
          fixPrice: null,
          auction: null,
        };
        if (nft.marketNftStatus == NFT_MARKET_STATUS.ON_FIX_PRICE) {
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
            .where('sn.nft = :id', { id: nft.nftId })
            .andWhere('sn.status = :status', { status: SaleNftStatus.SUCCESS })
            .andWhere('sn.action = :action', {
              action: SaleNftType.PUT_ON_SALE,
            })
            .andWhere('sn.fromUser = :fromUser', {
              fromUser: nft.creator.userId,
            })
            .getRawOne();
          nft['saleData'].fixPrice = putOnSales;
          nft.tokenPriceIcon = putOnSales ? putOnSales.tokenPriceIcon : '';
        }

        if (
          [
            NFT_MARKET_STATUS.IMCOMMING_AUCTION,
            NFT_MARKET_STATUS.ON_AUCTION,
            NFT_MARKET_STATUS.END_AUCTION,
            NFT_MARKET_STATUS.CANCEL_AUCTION,
          ].includes(nft.marketNftStatus)
        ) {
          let actionSaleNft;
          let status;
          switch (nft.marketNftStatus) {
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
            .where('sn.nft = :id', { id: nft.nftId })
            .andWhere('sn.status = :status', { status: status })
            .andWhere(`sn.action = ${actionSaleNft}`)
            .andWhere(`sn.fromUser = ${nft.owner.userId}`)
            // .orderBy('sn.id', 'DESC')
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

          nft['saleData'].auction = auction;
        }
        return nft;
      }),
    );

    return { list, count };
  }

  getAllCollectionOfExchange() {
    return this.collectionsRepository.getAllCollection();
  }
}
