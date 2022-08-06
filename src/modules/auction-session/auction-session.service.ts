import {
  BadRequestException,
  Injectable,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { In, MoreThan } from 'typeorm';
import { AuctionSessionRepository } from 'src/modules/auction-session/auction-session.repository';
import { CreateAuctionSession } from './dto/create-auction-session.dto';
import { User } from '../users/entities/user.entity';
import { OwnerNftService } from '../owner-nft/owner-nft.service';
import { NftsRepository } from '../nfts/nfts.repository';
import { StandardType } from '../nfts/enums';
import moment from 'moment';
import { CustomErrorMessage } from 'src/common/constants/error-message';
import { NetworkService } from '../networks/network.service';
import { UserRepository } from '../users/user.repository';
import { NetworkTokenStatus } from '../network-tokens/enums';
import { NftsService } from 'src/modules/nfts/nfts.service';
import { UserService } from '../users/user.service';
import { AuctionBlockchainService } from '../blockchains/auction-blockchain.service';
import { MarketBlockchainService } from '../blockchains/market-blockchain.service';
import { AuctionSessionStatus } from './enums';
import { AuctionSession } from './entities/auction-session.entity';
import { NetworkToken } from '../network-tokens/entities/network-token.entity';
import { SaleNftStatus, SaleNftType } from '../sale-nft/const';

@Injectable()
export class AuctionSessionService {
  constructor(
    private readonly auctionSessionRepository: AuctionSessionRepository,
    private readonly ownerNftService: OwnerNftService,
    private readonly nftsRepository: NftsRepository,
    private readonly auctionBlockChainService: AuctionBlockchainService,
    private readonly marketBlockchainService: MarketBlockchainService,
    private readonly networkService: NetworkService,
    private readonly userRepository: UserRepository,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    @Inject(forwardRef(() => NftsService))
    private readonly nftService: NftsService,
  ) {}

  async findOne(id: number, status?: number[]) {
    status = status
      ? status
      : [AuctionSessionStatus.NEW, AuctionSessionStatus.ACTIVE];
    const result = await this.auctionSessionRepository.findOne({
      where: {
        id,
        status: In(status),
      },
      relations: ['user'],
    });
    if (!result) {
      throw new BadRequestException(CustomErrorMessage['AUCTION.NOT_FOUND']);
    }
    return result;
  }

  async findOneWithNftId(id: number, status?: number[]) {
    status = status
      ? status
      : [AuctionSessionStatus.NEW, AuctionSessionStatus.ACTIVE];
    const result = await this.auctionSessionRepository.findOne({
      where: {
        nftId: id,
        status: In(status),
      },
      relations: ['user'],
    });
    if (!result) {
      throw new BadRequestException(CustomErrorMessage['AUCTION.NOT_FOUND']);
    }
    return result;
  }

  async newAuctionWithMintNft(
    user: User,
    body: CreateAuctionSession,
    NetworkToken: NetworkToken,
  ) {
    const auction = new AuctionSession();
    auction.nftId = body.nftId;
    auction.userId = user.id;
    auction.highestPrice = body.startPrice;
    auction.startPrice = body.startPrice;
    auction.startTime = new Date(body.startTime);
    auction.endTime = new Date(body.endTime);
    auction.receiveToken = body.receiveToken;
    auction.status = AuctionSessionStatus.MINT_WITH_NFT;
    auction.networkToken = NetworkToken;
    auction.scAuctionId = -1;
    return this.auctionSessionRepository.save(auction);
  }

  async newAuctionSession(user: User, body: CreateAuctionSession) {
    const nft = await this.nftsRepository.findOne({
      where: {
        id: body.nftId,
      },
      relations: [
        'network',
        'collections',
        'collections.network',
        'user',
        'user.userWallet',
      ],
    });

    if (!nft || nft.standardType !== StandardType.ERC_721) {
      throw new BadRequestException(CustomErrorMessage['NFT.NOT_FOUND']);
    }

    const isOwner = await this.ownerNftService.isOwnerByNftid(user, nft.id);
    if (!isOwner) {
      throw new BadRequestException(
        CustomErrorMessage['AUCTION.USER_NOT_HAVE_PERMISSION'],
      );
    }

    const [network, fromUserWalletInfo] = await Promise.all([
      this.networkService.findOne(nft.networkId),
      this.userRepository
        .createQueryBuilder('user')
        .where('user.id = :id', { id: user.id })
        .innerJoinAndSelect('user.userWallet', 'userWallet')
        .addSelect('userWallet.privateKeyEncryptedValue')
        .getOne(),
    ]);

    const networkToken = network.networkTokens.find(
      (networkToken) =>
        networkToken.tokenName === body.receiveToken &&
        networkToken.status === NetworkTokenStatus.ACTIVE,
    );
    if (!networkToken) {
      throw new BadRequestException(
        CustomErrorMessage['NETWORK_TOKEN.NOT_FOUND'],
      );
    }

    let approveAllData = null;

    if (
      !(await this.marketBlockchainService.isApprovedForAll(
        fromUserWalletInfo.userWallet.address,
        nft.collections,
        network,
      ))
    ) {
      approveAllData = await this.marketBlockchainService.setApprovalForAll(
        fromUserWalletInfo.userWallet.address,
        nft.collections,
        network,
        user.userWallet.type,
      );
    }

    const result = await this.auctionBlockChainService.createAuction(
      user.userWallet.address,
      nft.collections.contractAddress,
      networkToken.contractAddress,
      nft.tokenId,
      body.startPrice,
      moment(body.startTime).utc().unix(),
      moment(body.endTime).utc().unix(),
      network,
      networkToken,
    );
    return { ...result, approveAllData };
  }

  async cancelAuction(auctionId, user) {
    const auction = await this.auctionSessionRepository.findOne({
      where: {
        userId: user.id,
        id: auctionId,
        status: In([AuctionSessionStatus.NEW, AuctionSessionStatus.ACTIVE]),
      },
    });

    if (!auction) {
      throw new BadRequestException('Auction Invalid');
    }

    const nft = await this.nftsRepository.findOne({
      where: {
        id: auction.nftId,
      },
      relations: [
        'network',
        'collections',
        'collections.network',
        'user',
        'user.userWallet',
      ],
    });

    if (!nft || nft.standardType !== StandardType.ERC_721) {
      throw new BadRequestException(
        CustomErrorMessage['AUCTION.NFT_HAS_BLOCK'],
      );
    }

    const dataReturn = await this.auctionBlockChainService.cancelAuction(
      auction.scAuctionId,
      user.userWallet.address,
      nft.network,
    );

    return { ...auction, dataReturn };
  }

  async getHighestBidder(auctionId: number) {
    return this.auctionSessionRepository
      .createQueryBuilder('as')
      .select(['uw.address'])
      .leftJoin('sale_nft', 'sn', 'sn.auctionSessionId = as.id')
      .leftJoin('users', 'u', 'u.id = sn.fromUser')
      .leftJoin('user-wallet', 'uw', 'u.userWallet = uw.id')
      .where('sn.auctionSessionId = :auctionSessionId', {
        auctionSessionId: auctionId,
      })
      .andWhere('sn.action = :action', { action: SaleNftType.BID_NFT })
      .andWhere('sn.status IN (:status)', {
        status: [SaleNftStatus.SUCCESS, SaleNftStatus.MAKE_OFFER_EXPIRED],
      })
      .orderBy('sn.price', 'DESC')
      .limit(1)
      .getRawOne();
  }
}
