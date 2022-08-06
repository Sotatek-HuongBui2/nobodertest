import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { SaleNftRepository } from './sale-nft.repository';
import { User } from '../users/entities/user.entity';
import { AuctionSessionService } from '../auction-session/auction-session.service';
import { Repository, In } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Nfts } from '../nfts/entities/nfts.entity';
import { SaleNftService } from './sale-nft.service';
import { OwnerNftService } from '../owner-nft/owner-nft.service';
import { NetworkService } from '../networks/network.service';
import { CustomErrorMessage } from 'src/common/constants/error-message';
import { PlaceBidAuctionDto } from './dto/auction/place-bid.dto';
import { AuctionSessionStatus } from '../auction-session/enums';
import { SaleNftStatus, SaleNftType } from './const';
import { NftStatus, StandardType } from '../nfts/enums';
import { MarketBlockchainService } from '../blockchains/market-blockchain.service';
import { AuctionMarketBlockchainService } from '../blockchains/auction-market-blockchain.service';

@Injectable()
export class SaleNftAuctionService {
  constructor(
    @InjectRepository(Nfts)
    private nftsRepository: Repository<Nfts>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly saleNftRepository: SaleNftRepository,
    @Inject(forwardRef(() => AuctionSessionService))
    private readonly auctionSessionService: AuctionSessionService,
    private readonly marketBlockchainService: MarketBlockchainService,
    private readonly auctionMarketBlockchainService: AuctionMarketBlockchainService,
    private readonly ownerNftService: OwnerNftService,
    private readonly saleNftService: SaleNftService,
    private readonly networkService: NetworkService,
  ) {}

  async createBidAuctionSession(
    auctionSessionId: number,
    user: User,
    body: PlaceBidAuctionDto,
  ) {
    const [auctionSession, isHasBid] = await Promise.all([
      this.auctionSessionService.findOne(auctionSessionId, [
        AuctionSessionStatus.ACTIVE,
      ]),
      this.saleNftRepository.count({
        auctionSessionId,
        action: SaleNftType.BID_NFT,
        status: SaleNftStatus.SUCCESS,
      }),
    ]);

    const nft = await this.nftsRepository.findOne({
      where: {
        id: auctionSession.nftId,
      },
      relations: [
        'network',
        'user',
        'user.userWallet',
        'collections',
        'collections.network',
      ],
    });
    if (!nft || nft.standardType !== StandardType.ERC_721) {
      throw new BadRequestException(CustomErrorMessage['NFT.NOT_FOUND']);
    }
    if (nft.status !== NftStatus.DONE) {
      throw new BadRequestException(CustomErrorMessage['NFT.NFT_STATUS_WRONG']);
    }

    if (
      (!isHasBid && body.price < Number(auctionSession.startPrice)) ||
      (isHasBid &&
        body.price <
          Number(auctionSession.highestPrice) +
            Number(auctionSession.highestPrice) * 0.05)
    ) {
      throw new BadRequestException(
        CustomErrorMessage['AUCTION.STEP_PRICE_ERROR'],
      );
    }
    if (user.id === auctionSession.user.id) {
      throw new BadRequestException(
        CustomErrorMessage['AUCTION.WRONG_OBJECT_BID'],
      );
    }

    const network = await this.networkService.findOne(nft.networkId);
    const networkToken = network.networkTokens.find(
      (networkToken) => networkToken.tokenName === auctionSession.receiveToken,
    );
    if (!networkToken) {
      throw new BadRequestException(
        CustomErrorMessage['NETWORK_TOKEN.NOT_FOUND'],
      );
    }

    let fee = 0;
    if (user.userWallet.type === 0) {
      fee = 0.01;
    }
    const balance = await this.marketBlockchainService.getBalance(
      user.userWallet.address,
      auctionSession.receiveToken,
      network,
    );

    if (balance < body.price * 1 + fee) {
      throw new BadRequestException(
        CustomErrorMessage['SALE_NFT_BALANCE_NOT_ENOUGH'],
      );
    }

    const tx = await this.auctionMarketBlockchainService.bidAuction(
      user.userWallet.address,
      nft.collections.contractAddress,
      networkToken.contractAddress,
      nft.tokenId,
      auctionSession.scAuctionId,
      body.price,
      network,
      networkToken,
    );

    return { ...tx };
  }

  async acceptBidAuctionSession(
    auctionSessionId: number,
    bidId: number,
    user: User,
  ) {
    const saleNft = await this.saleNftRepository.findOne({
      where: {
        id: bidId,
        action: SaleNftType.BID_NFT,
        status: SaleNftStatus.SUCCESS,
      },
      relations: [
        'nft',
        'nft.network',
        'nft.collections',
        'nft.collections.network',
        'nft.user',
      ],
    });

    if (!saleNft) {
      throw new BadRequestException(
        CustomErrorMessage['AUCTION.BID_NOT_FOUND'],
      );
    }

    const auctionSession = await this.auctionSessionService.findOne(
      saleNft.auctionSessionId,
      [
        AuctionSessionStatus.ACTIVE,
        AuctionSessionStatus.CANCEL,
        AuctionSessionStatus.END,
        AuctionSessionStatus.UNSUCCESSFUL,
        ,
      ],
    );

    if (auctionSession.id !== auctionSessionId) {
      throw new BadRequestException(CustomErrorMessage['AUCTION.NOT_FOUND']);
    }
    if (auctionSession.user.id !== user.id || saleNft.toUser.id !== user.id) {
      throw new BadRequestException(
        CustomErrorMessage['AUCTION.USER_NOT_HAVE_PERMISSION_WITH_BID'],
      );
    }

    const nft = await this.nftsRepository.findOne({
      where: {
        id: auctionSession.nftId,
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

    const network = await this.networkService.findOne(nft.networkId);

    const dataReturn =
      await this.auctionMarketBlockchainService.acceptBidAuction(
        user.userWallet.address,
        Number(saleNft.bidId),
        network,
      );

    return { dataReturn };
  }

  async reClaimNftAuctionSession(auctionSessionId: number, user: User) {
    const auctionSession = await this.auctionSessionService.findOne(
      auctionSessionId,
      [
        AuctionSessionStatus.UNSUCCESSFUL,
        AuctionSessionStatus.CANCEL,
        AuctionSessionStatus.END,
      ],
    );

    if (auctionSession.user.id !== user.id) {
      throw new BadRequestException(
        CustomErrorMessage['AUCTION.USER_NOT_HAVE_PERMISSION'],
      );
    }

    const nft = await this.nftsRepository.findOne({
      where: {
        id: auctionSession.nftId,
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

    const network = await this.networkService.findOne(nft.networkId);

    const dataReturn = await this.auctionMarketBlockchainService.reclaimAuction(
      user.userWallet.address,
      auctionSession.scAuctionId,
      network,
    );

    return { dataReturn };
  }

  async cancelBidAuctionSession(
    auctionSessionId: number,
    bidId: number,
    user: User,
  ) {
    const [bidPlaced, auctionSession] = await Promise.all([
      this.saleNftRepository.findOne({
        where: {
          id: bidId,
          action: SaleNftType.BID_NFT,
          status: In([SaleNftStatus.SUCCESS, SaleNftStatus.MAKE_OFFER_EXPIRED]),
          auctionSessionId: auctionSessionId,
          fromUser: {
            id: user.id,
          },
        },
        relations: [
          'nft',
          'nft.network',
          'nft.collections',
          'nft.collections.network',
          'nft.user',
        ],
      }),
      this.auctionSessionService.findOne(auctionSessionId, [
        AuctionSessionStatus.ACTIVE,
        AuctionSessionStatus.UNSUCCESSFUL,
        AuctionSessionStatus.END,
        AuctionSessionStatus.CANCEL,
        AuctionSessionStatus.DONE,
      ]),
    ]);

    if (!bidPlaced) {
      throw new BadRequestException(
        CustomErrorMessage['AUCTION.BID_NOT_FOUND'],
      );
    }

    if (!auctionSession) {
      throw new BadRequestException(CustomErrorMessage['AUCTION.NOT_FOUND']);
    }

    const nft = await this.nftsRepository.findOne({
      where: {
        id: auctionSession.nftId,
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

    const network = await this.networkService.findOne(nft.networkId);

    const dataReturn =
      await this.auctionMarketBlockchainService.cancelBidAuction(
        user.userWallet.address,
        bidPlaced.bidId,
        network,
      );

    return { dataReturn };
  }
}
