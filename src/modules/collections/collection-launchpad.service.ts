import { forwardRef, HttpException, Inject, Injectable } from "@nestjs/common";
import { AuctionSessionService } from "../auction-session/auction-session.service";
import { NetworkRepository } from "../networks/network.repository";
import { NftStatus, NFT_CATEGORIES, NFT_MARKET_STATUS } from "../nfts/enums";
import { NftsRepository } from "../nfts/nfts.repository";
import { NftsService } from "../nfts/nfts.service";
import { OwnerNftRepository } from "../owner-nft/owner-nft.repository";
import { RateCoinService } from "../rateCoins/rate-coin.service";
import { SaleNftStatus, SaleNftType } from "../sale-nft/const";
import { SaleNftRepository } from "../sale-nft/sale-nft.repository";
import { UserRepository } from "../users/user.repository";
import { CollectionLaunchpadRepository } from "./collection-launchpad.repository";
import { CollectionsRepository } from "./collections.repository";
import { GetAllCollectionLaunchpadDto } from "./dto/get-all-collection-launchpad.dto";
import { GetNftsOfLaunchpadDto } from "./dto/get-nfts-of-launchpad.dto";
import { CollectionLaunchpadStatus } from "./enums";

@Injectable()
export class CollectionLaunchpadService {
  constructor(
    private readonly collectionLaunchpadRepo: CollectionLaunchpadRepository,
    private readonly collectionRepository: CollectionsRepository,
    private readonly networkRepository: NetworkRepository,
    private readonly nftRepository: NftsRepository,
    private readonly ownerNftRepository: OwnerNftRepository,
    private readonly saleNftRepository: SaleNftRepository,
    private readonly userRepository: UserRepository,
    private readonly auctionSessionService: AuctionSessionService,
    private readonly rateCoinService: RateCoinService,
    @Inject(forwardRef(() => NftsService)) private nftService: NftsService,
  ) { }

  async getAllCollectionLaunchPad(parameters: GetAllCollectionLaunchpadDto) {
    let { page, limit } = parameters;
    try {
      let [collectionLaunchpads, total] = await this.collectionLaunchpadRepo.findAndCount({
        where: { status: CollectionLaunchpadStatus.VISIBLE },
        skip: limit * (page - 1),
        take: limit,
      });
      if (total < 1) {
        return {
          count: 0,
          listCollectionAllUser: []
        };
      }

      let networks = await this.networkRepository.find({
        select: ['image', 'id', 'name']
      });
      networks.map((item) => {
        item['networkId'] = item.id;
        item['networkName'] = item.name;
        delete (item.id);
        delete (item.name);
      })
      const launchpadIds = collectionLaunchpads.map(item => item.id);
      const countTotalNft = await this.nftRepository.createQueryBuilder('nfts')
        .select([
          'launchpad_id',
          'COUNT(*) as totalNft'
        ])
        .where('status = :status', { status: NftStatus.DONE })
        .andWhere('is_draft = 0')
        .andWhere('launchpad_id in (:launchpadIds)', { launchpadIds: launchpadIds })
        .groupBy('launchpad_id')
        .getRawMany();
      var countTotalNftObj = countTotalNft.reduce((obj, item) => Object.assign(obj, { [item.launchpad_id]: item.totalNft }), {});

      collectionLaunchpads.map((item) => {
        item.bannerImage = item.thumbnailImage;
        item['owner'] = {
          name: item.creatorName,
          description: item.creatorDescription,
        };
        let networkIds = JSON.parse(item.chain);
        item['networks'] = networks.filter(item => networkIds.includes(item['networkId']));
        item['totalNft'] = countTotalNftObj[item.id] ?? 0;
        delete (item.chain);
        delete (item.creatorName);
        delete (item.creatorDescription);
        delete (item.thumbnailImage);
      })

      return {
        count: total,
        listCollectionAllUser: collectionLaunchpads
      };
    } catch (error) {
      console.log(error);
      throw new HttpException({ message: 'Get list launchpad collection error' }, 500);
    }
  }

  async getLaunchpadDetail(launchpadId: number) {
    try {
      let launchpad = await this.collectionLaunchpadRepo.findOne({ where: { id: launchpadId } });
      if (!launchpad) {
        return {};
      }

      launchpad['user'] = { name: launchpad.creatorName, description: launchpad.creatorDescription };
      delete (launchpad.creatorName);
      delete (launchpad.creatorDescription);
      delete (launchpad.chain);
      let totalNft = await this.nftRepository.count({ where: { status: NftStatus.DONE, isDraft: 0, launchpadId } });
      launchpad['totalNft'] = totalNft;
      let totalOwner = await this.ownerNftRepository.createQueryBuilder('ow')
        .select(['COUNT(DISTINCT(user_id)) as cnt'])
        .where(`nfts_id IN (SELECT id FROM nfts WHERE launchpad_id = ${launchpadId})`)
        .andWhere('sale_total > 0')
        .getRawOne();
      launchpad['totalOwner'] = Number(totalOwner.cnt);

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
        .where(`nft_id IN (SELECT id FROM nfts WHERE launchpad_id = ${launchpadId})`)
        .getRawOne();
      launchpad['floorPrice'] = tradedInfo.floorPrice ?? 0;
      launchpad['volumeTraded'] = tradedInfo.volumeTraded ?? 0;

      return launchpad;
    } catch (error) {
      console.log(error);
      throw new HttpException({ message: 'Get launchpad collection detail error' }, 500);
    }
  }

  async getNftsOfLaunchpad(parameters: GetNftsOfLaunchpadDto) {
    const { page, limit, launchpadId } = parameters;
    let [nfts, count] = await this.getListNftAndTotalPaginated(page, limit, launchpadId);

    if (count < 1) {
      return { list: [], count };
    }

    const [creatorKeyById, collectionsKeyById, ownersKeyByNftId] = await this.getCreatorsAndCollectionsAndOwnersByNft(nfts);
    const networksKeyById = await this.getNetworksKeyById();

    nfts.map(async (nft) => {
      nft['creator'] = creatorKeyById[nft.userId];
      nft['owner'] = ownersKeyByNftId[nft.nftId] ?? creatorKeyById[nft.userId];
      nft['collection'] = collectionsKeyById[nft.collectionId] ?? null;
      nft['network'] = networksKeyById[nft.collection?.networkId] ?? null;
      nft['saleData'] = { fixPrice: null, auction: null };

      if (this.isNftOnSaleFixPrice(nft.marketNftStatus)) {
        const saleFixPriceData = await this.getSaleFixPriceDataOfNft(nft);
        nft['saleData'].fixPrice = saleFixPriceData;
        nft.tokenPriceIcon = saleFixPriceData ? saleFixPriceData.tokenPriceIcon : '';
      }

      if (this.isNftOnSaleAuction(nft.marketNftStatus)) {
        const auction = await this.getAuctionInfoOfNft(nft);
        nft['saleData'].auction = auction;
      }

      return nft;
    });

    if (parameters.userId) {
      nfts = await this.nftService.attackIsLikeData(parameters.userId, nfts);
    }
    return { list: nfts, count };
  }

  async getListNftAndTotalPaginated(page: number, limit: number, launchpadId: number) {
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
        'n.collections as collectionId',
        'n.category as category',
        'n.launchpadId as launchpadId',
        '(SELECT COUNT(*) FROM user_like_nft uln WHERE uln.nft_id = n.id AND uln.status = 1) as totalLike',
      ])
      .addSelect(
        '(SELECT sale_nft.price from sale_nft where sale_nft.nft_id = n.id order by id DESC Limit 1) as price',
      )
      .where(`n.launchpadId = ${launchpadId}`)
      .andWhere('n.isDraft = 0')
      .andWhere(`n.status = ${NftStatus.DONE}`)
      .limit(limit)
      .offset((page - 1) * limit);
    return await Promise.all([nftQuery.getRawMany(), nftQuery.getCount()]);
  }

  async getCreatorsAndCollectionsAndOwnersByNft(nfts: any) {
    const creatorsQuery = this.userRepository
      .createQueryBuilder('users')
      .select([
        'users.id as userId',
        'users.avatar as avatar',
        'users.userName as name',
        '(select uw.address from `user-wallet` uw where uw.id = users.userWallet) as address',
      ])
      .where('id in (:ids)', { ids: nfts.map(item => item.userId).filter((v, i, a) => a.indexOf(v) === i) });
    const collectionsQuery = this.collectionRepository
      .createQueryBuilder('c')
      .select([
        'c.name as name',
        'c.contractAddress as address',
        'c.iconImage as avatar',
        'c.id as collectionId',
        'c.networkId as networkId',
      ])
      .where(`c.id in (:ids)`, { ids: nfts.map(item => item.collectionId).filter((v, i, a) => a.indexOf(v) === i) });
    const ownersQuery = this.ownerNftRepository
      .createQueryBuilder('owner')
      .select([
        'users.id as userId',
        'users.user_name as name',
        'users.avatar as avatar',
        'userWallet.address as address',
        'owner.nfts_id as nftId',
      ])
      .where('owner.sale_total > 0')
      .andWhere(`owner.nfts_id in (:ids)`, { ids: nfts.map(item => item.nftId) })
      .leftJoin('users', 'users', 'owner.user_id = users.id')
      .leftJoin(
        'user-wallet',
        'userWallet',
        'userWallet.id = users.user_wallet_id',
      );
    const [creators, collections, owners] = await Promise.all([creatorsQuery.getRawMany(), collectionsQuery.getRawMany(), ownersQuery.getRawMany()]);

    const creatorKeyById = creators.reduce((obj, item) => Object.assign(obj, { [item.userId]: item }), {});
    const collectionsKeyById = collections.reduce((obj, item) => Object.assign(obj, { [Number(item.collectionId)]: item }), {});
    const ownersKeyByNftId = owners.reduce((obj, item) => Object.assign(obj, { [item.nftId]: item }), {});
    return [creatorKeyById, collectionsKeyById, ownersKeyByNftId];
  }

  async getNetworksKeyById() {
    let networks = await this.networkRepository.find({
      select: ['image', 'id', 'name']
    });
    networks.map((item) => {
      item['avatar'] = item.image;
      item['networkName'] = item.name;
      delete (item.image);
      delete (item.name);
    })
    return networks.reduce((obj, item) => Object.assign(obj, { [item.id]: item }), {});
  }

  async getAuctionInfoOfNft(nft: any) {
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
      .leftJoin('network_tokens', 'networkToken', 'networkToken.id = acs.networkTokenId')
      .where('sn.nft = :id', { id: nft.nftId })
      .andWhere('sn.status = :status', { status: status })
      .andWhere(`sn.action = ${actionSaleNft}`)
      .andWhere(`sn.fromUser = ${nft.owner.userId}`)
      // .orderBy('sn.id', 'DESC')
      .getRawOne();
    if (auction) {
      const highestBidder = await this.auctionSessionService.getHighestBidder(auction.auctionId);
      auction.highestBidder = highestBidder?.uw_address ? highestBidder.uw_address : '';
    }
    return auction;
  }

  async getSaleFixPriceDataOfNft(nft: any) {
    return await this.saleNftRepository
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
      .andWhere('sn.action = :action', { action: SaleNftType.PUT_ON_SALE })
      .andWhere('sn.fromUser = :fromUser', { fromUser: nft.owner.userId })
      .getRawOne();
  }

  isNftOnSaleAuction(marketStatus: number) {
    return [NFT_MARKET_STATUS.IMCOMMING_AUCTION, NFT_MARKET_STATUS.ON_AUCTION, NFT_MARKET_STATUS.END_AUCTION, NFT_MARKET_STATUS.CANCEL_AUCTION].includes(marketStatus);
  }

  isNftOnSaleFixPrice(marketStatus: number) {
    return marketStatus == NFT_MARKET_STATUS.ON_FIX_PRICE;
  }
}
