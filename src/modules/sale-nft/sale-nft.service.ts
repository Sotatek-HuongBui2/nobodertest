import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { NetworkTokensService } from '../network-tokens/network-tokens.service';
import { NetworkService } from '../networks/network.service';
import { UserService } from 'src/modules/users/user.service';
import { MarketBlockchainService } from '../blockchains/market-blockchain.service';
import { SaleNftRepository } from './sale-nft.repository';
import { Nfts } from '../nfts/entities/nfts.entity';
import { In, Not, Repository } from 'typeorm';
import { User } from 'src/modules/users/entities/user.entity';
import { OwnerNft } from '../owner-nft/entities/owner-nft.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateSaleNftDto } from './dto/create-sale-nft.dto';
import { CustomErrorMessage } from 'src/common/constants/error-message';
import { collectionType } from '../collections/enums';
import { SaleNftStatus, SaleNftType } from './const';
import { NftStatus, NftType, NFT_MARKET_STATUS } from '../nfts/enums';
import { SaleNft } from './entities/sale-nft.entity';
import { Network } from '../networks/entities/network.entity';
import { decrypt } from 'src/common/utility/kms.utility';
import { CreateMakeOfferDto } from './dto/create-make-offer.dto';
import { BuyOrAcceptNft } from './dto/buy-nft.dto';
import { NetworkTokenStatus } from '../network-tokens/enums';
import SOCKET_EVENT, {
  createSocketData,
  sendToSocket,
} from 'src/common/utility/socket';
import { PagingDto } from './dto/paging-dto';
import { Pagination } from 'nestjs-typeorm-paginate';
import { BidHistory } from './dto/bid-history.dto';
import { SearchSort } from './dto/search.dto';
import { TradingHistory } from './dto/trading-history.dto';
import { EditOrderDto } from './dto/edit-order.dto';
import { RateCoinService } from 'src/modules/rateCoins/rate-coin.service';
@Injectable()
export class SaleNftService {
  constructor(
    @InjectRepository(OwnerNft)
    private ownerNftsRepository: Repository<OwnerNft>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Nfts)
    private nftsRepository: Repository<Nfts>,
    private readonly saleNftRepository: SaleNftRepository,
    private readonly marketBlockchainService: MarketBlockchainService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    private readonly networkService: NetworkService,
    private readonly networkTokenService: NetworkTokensService,
    private readonly rateCoinService: RateCoinService,
  ) { }

  private readonly logger = new Logger(SaleNftService.name);

  async makeOffer(createMakeOfferDto: CreateMakeOfferDto, user: User) {
    const [ownerNftArr, nft] = await Promise.all([
      this.ownerNftsRepository.find({
        where: {
          user: { id: createMakeOfferDto.fromUser.id },
          nfts: { id: createMakeOfferDto.nftId },
          saleTotal: 1,
        },
      }),
      this.nftsRepository.findOne(createMakeOfferDto.nftId),
    ]);
    const ownerNft = ownerNftArr.length ? ownerNftArr[0] : undefined;

    if (!nft) {
      throw new BadRequestException(
        CustomErrorMessage['SALE_NFT_INVALID_NFT_ID'],
      );
    }

    if (ownerNft && ownerNft.user.id === user.id) {
      throw new BadRequestException(
        CustomErrorMessage['SALE_NFT_BUY_SELF_NFT'],
      );
    }

    if (createMakeOfferDto.quantity != 1) {
      throw new BadRequestException(
        CustomErrorMessage['SALE_NFT_INVALID_QUANTITY'],
      );
    }

    const network = await this.networkService.findOne(nft.networkId);
    const networkToken = network.networkTokens.find(
      (networkToken) =>
        networkToken.tokenName === createMakeOfferDto.receiveToken &&
        networkToken.status === NetworkTokenStatus.ACTIVE,
    );
    if (!networkToken) {
      throw new BadRequestException(
        CustomErrorMessage['MAKE_OFFER_WRONG_RECEIVE_TOKEN'],
      );
    }
    createMakeOfferDto.networkTokenId = networkToken.id;

    let fee = 0;
    if (user.userWallet.type === 0) {
      fee = 0.01;
    }
    const balance = await this.marketBlockchainService.getBalance(
      user.userWallet.address,
      createMakeOfferDto.receiveToken,
      network,
    );

    const price = createMakeOfferDto.totalPrice;
    if (balance < price * createMakeOfferDto.quantity + fee) {
      throw new BadRequestException(
        CustomErrorMessage['SALE_NFT_BALANCE_NOT_ENOUGH'],
      );
    }

    createMakeOfferDto.small_image = nft.smallImage;
    let saleNft: SaleNft;
    if (user.userWallet.type === 0) {
      saleNft = await this.saleNftRepository.save(
        await createMakeOfferDto.toEntity(this.userService, price),
      );
    } else {
      saleNft = await createMakeOfferDto.toEntity(this.userService, price);
    }
    const dataReturn = await this.broadcastTransaction(
      saleNft,
      network,
      user.userWallet.type,
    );

    if (user.userWallet.type > 0)
      return { dataReturn, nonce: user.userWallet.nonce };

    return { ...saleNft, dataReturn };
  }

  async getListOffer(nftId: number, option: PagingDto) {
    const listMakeOffer = await this.saleNftRepository.find({
      relations: [
        'nft',
        'nft.network',
        'nft.collections',
        'nft.collections.network',
        'nft.user',
        'networkToken',
        'networkToken.network',
      ],
      where: {
        nft: { id: nftId },
        action: SaleNftType.MAKE_OFFER,
        status: In([SaleNftStatus.SUCCESS, SaleNftStatus.MAKE_OFFER_EXPIRED]),
      },
      skip: option.limit * (option.page - 1),
      take: option.limit,
    });
    return listMakeOffer.map((saleNft) => {
      return {
        id: saleNft.id,
        price: saleNft.price,
        originalPrice: saleNft.originalPrice,
        receiveToken: saleNft.receiveToken,
        networkTokenId: saleNft.networkTokenId,
        networkTokenIcon: saleNft.networkToken.icon,
        fromUser: {
          id: saleNft.fromUser['id'],
          address: saleNft.fromUser['userWallet']['address'],
        },
        toUser: {
          id: saleNft.toUser['id'],
          address: saleNft.toUser['userWallet']['address'],
        },
        expired: saleNft.expired,
        status: saleNft.status,
        createdAt: saleNft.createdAt,
      };
    });
  }

  async cancelMakeOffer(saleNftId: number, user: User) {
    const [saleNft] = await Promise.all([
      this.saleNftRepository.find({
        id: saleNftId,
        fromUser: { id: user.id },
        status: In([SaleNftStatus.SUCCESS, SaleNftStatus.MAKE_OFFER_EXPIRED]),
        action: SaleNftType.MAKE_OFFER,
      }),
      //this.securityService.requireSecurityEnable(user.security.id, user.walletType),
    ]);

    if (saleNft.length > 0) {
      const [nftArr] = await Promise.all([
        this.nftsRepository.find({ id: saleNft[0].nft.id }),
        // this.checkBalanceAtLeast(user.userWallet.address, user.walletType, saleNft[0].receiveToken),
      ]);
      if (!nftArr.length) {
        throw new BadRequestException(
          CustomErrorMessage['SALE_NFT_INVALID_NFT_ID'],
        );
      }
      const nft = nftArr[0];

      const data = new SaleNft();
      data.action = SaleNftType.CANCEL_MAKE_OFFER;
      data.fromUser = { id: user.id, userName: user.userName };
      data.toUser = { id: user.id, userName: user.userName };
      data.nft = saleNft[0].nft;
      data.receiveToken = saleNft[0].receiveToken;
      data.orderId = saleNft[0].orderId;
      data.quantity = saleNft[0].quantity - saleNft[0].successQuantity;
      let result: SaleNft;
      if (user.userWallet.type === 0) {
        result = await this.saleNftRepository.save(data);
      } else {
        result = data;
      }

      const network = await this.networkService.findOne(nft.networkId);
      const dataReturn = await this.broadcastTransaction(
        result,
        network,
        user.userWallet.type,
        false,
      );

      return { dataReturn, nonce: user.userWallet.nonce };
    } else {
      throw new BadRequestException(
        CustomErrorMessage['SALE_NFT_INVALID_NFT_ID'],
      );
    }
  }

  async acceptNft(createSaleNftDto: BuyOrAcceptNft, user: User) {
    const saleNft = await this.saleNftRepository.findOneSaleNft(
      createSaleNftDto.saleNftId,
      SaleNftType.MAKE_OFFER,
    );

    if (saleNft.length > 0 && saleNft[0].fromUser.id !== user.id) {
      const nftArr = await this.nftsRepository.find({
        where: { id: saleNft[0].nft.id },
      });
      const nft = nftArr[0];

      if (nft.status !== NftStatus.DONE) {
        throw new BadRequestException(
          CustomErrorMessage['NFT.NFT_STATUS_WRONG'],
        );
      }

      const putOnSale = await this.saleNftRepository.findSaleNftByNftId(
        saleNft[0].nft.id,
        SaleNftType.PUT_ON_SALE,
        user.id,
        [SaleNftStatus.SUCCESS],
      );

      const putOnAuction = await this.saleNftRepository.find({
        relations: ['auctionSession'],
        where: {
          nft: {
            id: saleNft[0].nft.id,
            marketStatus: In([
              NFT_MARKET_STATUS.END_AUCTION,
              NFT_MARKET_STATUS.CANCEL_AUCTION,
              NFT_MARKET_STATUS.IMCOMMING_AUCTION,
              NFT_MARKET_STATUS.ON_AUCTION,
            ]),
          },
          action: In([SaleNftType.PUT_AUCTION, SaleNftType.CANCEL_AUCTION]),
          fromUser: user.id,
          status: In([SaleNftStatus.SUCCESS, SaleNftStatus.NOT_COUNT]),
        },
      });

      let isAcceptHasPutSale;
      if (nft.marketStatus === NFT_MARKET_STATUS.ON_FIX_PRICE) {
        isAcceptHasPutSale = 1;
      } else if (
        [
          NFT_MARKET_STATUS.END_AUCTION,
          NFT_MARKET_STATUS.CANCEL_AUCTION,
          NFT_MARKET_STATUS.IMCOMMING_AUCTION,
          NFT_MARKET_STATUS.ON_AUCTION,
        ].includes(nft.marketStatus)
      ) {
        isAcceptHasPutSale = 2;
      } else {
        isAcceptHasPutSale = 3;
      }

      const listOrderId = [];
      let totalQuantitySale = 1;
      let totalReceive = 0;
      if (isAcceptHasPutSale == 1) {
        putOnSale.forEach((e) => {
          totalQuantitySale += e.quantity - e.successQuantity;
          if (totalQuantitySale <= createSaleNftDto.quantity) {
            totalReceive += totalQuantitySale;
            listOrderId.push(e.orderId);
          }
        });

        if (totalReceive < createSaleNftDto.quantity) {
          listOrderId.push(putOnSale[listOrderId.length].orderId);
        }
      }
      if (isAcceptHasPutSale == 2) {
        putOnAuction.forEach((e) => {
          totalQuantitySale += e.quantity - e.successQuantity;
          if (totalQuantitySale <= createSaleNftDto.quantity) {
            totalReceive += totalQuantitySale;
            listOrderId.push(e.auctionSession.scAuctionId);
          }
        });

        if (totalReceive < createSaleNftDto.quantity) {
          listOrderId.push(
            putOnAuction[listOrderId.length].auctionSession.scAuctionId,
          );
        }
      }

      if (
        createSaleNftDto.quantity > saleNft[0].quantity ||
        createSaleNftDto.quantity <= 0 ||
        (createSaleNftDto.quantity > totalQuantitySale && isAcceptHasPutSale)
      ) {
        throw new BadRequestException(
          CustomErrorMessage['SALE_NFT_INVALID_QUANTITY'],
        );
      }

      if (
        createSaleNftDto.quantity + saleNft[0].successQuantity >
        saleNft[0].quantity
      ) {
        throw new BadRequestException(
          CustomErrorMessage['SALE_NFT_QUANTITY_GREATER_THAN_STOCK_QUANTITY'],
        );
      }
      createSaleNftDto.toUser = {
        id: saleNft[0].toUser.id,
        userName: saleNft[0].toUser.userName,
      };
      createSaleNftDto.price = saleNft[0].price;
      createSaleNftDto.receiveToken = saleNft[0].receiveToken;
      createSaleNftDto.nftId = saleNft[0].nft.id;
      createSaleNftDto.orderId = saleNft[0].orderId;
      createSaleNftDto.small_image = saleNft[0].nft.smallImage;
      let result: SaleNft;
      if (user.userWallet.type === 0) {
        result = await this.saleNftRepository.save(
          await createSaleNftDto.toEntity(),
        );
      } else {
        result = await createSaleNftDto.toEntity();
      }

      const network = await this.networkService.findOne(nft.networkId);
      const dataReturn = await this.broadcastTransaction(
        result,
        network,
        user.userWallet.type,
        false,
        0,
        listOrderId,
        isAcceptHasPutSale,
      );

      if (user.userWallet.type > 0)
        return { dataReturn, nonce: user.userWallet.nonce };

      return { ...result, dataReturn };
    } else {
      throw new BadRequestException(
        CustomErrorMessage['SALE_NFT_INVALID_SALE_NFT_ID'],
      );
    }
  }

  async putOnSale(createSaleNftDto: CreateSaleNftDto, user: User) {
    console.log('putOnSale::createSaleNftDto:', createSaleNftDto);

    const nft = await this.ownerNftsRepository.findOne({
      relations: [
        'user',
        'nfts',
        'nfts.user',
        'nfts.network',
        'nfts.collections',
        'nfts.collections.network',
      ],
      where: {
        user: { id: createSaleNftDto.fromUser.id },
        nfts: { id: createSaleNftDto.nftId },
      },
    });

    if (!nft) {
      throw new BadRequestException(
        CustomErrorMessage['SALE_NFT_INVALID_NFT_ID'],
      );
    } else {
      if (nft.nfts.status !== NftStatus.DONE) {
        throw new BadRequestException(
          CustomErrorMessage['NFT.NFT_STATUS_WRONG'],
        );
      }

      if (
        nft.nfts.collections.type !== collectionType.xanalia721 &&
        nft.nfts.collections.type !== collectionType.xanalia721Artist &&
        nft.nfts.collections.type !== collectionType.default
      ) {
        throw new BadRequestException(CustomErrorMessage['NFT.NOT_SUPPORT']);
      }

      // const platformCommission = nft.nfts.platformCommission / 100;
      const totalPrice = createSaleNftDto.price;
      // createSaleNftDto.price *
      // (1 + platformCommission + nft.nfts.royalty / 100);
      if (Math.ceil(Math.log(totalPrice + 1) / Math.LN10) > 10) {
        throw new BadRequestException(
          CustomErrorMessage['SALE_NFT_PRICE_TOO_BIG'],
        );
      }
    }
    if (
      nft.saleTotal < createSaleNftDto.quantity ||
      createSaleNftDto.quantity <= 0
    ) {
      throw new BadRequestException(
        CustomErrorMessage['SALE_NFT_CAN_NOT_PUT_ON_SALE'],
      );
    }

    const [checkSaleNft, network] = await Promise.all([
      this.saleNftRepository.findSaleNftByNftId(
        createSaleNftDto.nftId,
        SaleNftType.PUT_ON_SALE,
        createSaleNftDto.fromUser.id,
        [SaleNftStatus.SUCCESS],
      ),
      this.networkService.findOne(nft.nfts.networkId),
    ]);

    let quantityActive = nft.saleTotal - createSaleNftDto.quantity;
    checkSaleNft.forEach((sNft) => {
      quantityActive -= sNft.quantity - sNft.successQuantity;
    });
    if (quantityActive < 0) {
      throw new BadRequestException(
        CustomErrorMessage['SALE_NFT_CAN_NOT_PUT_ON_SALE'],
      );
    }

    createSaleNftDto.small_image = nft.nfts.smallImage;
    createSaleNftDto.standardType = nft.nfts.standardType;
    let saleNft: SaleNft;
    if (user.userWallet.type === 0) {
      saleNft = await this.saleNftRepository.save(
        await createSaleNftDto.toEntity(
          this.userService,
          this.networkTokenService,
        ),
      );
    } else {
      saleNft = await createSaleNftDto.toEntity(
        this.userService,
        this.networkTokenService,
      );
    }
    const dataReturn = await this.broadcastTransaction(
      saleNft,
      network,
      user.userWallet.type,
      false,
    );

    if (user.userWallet.type > 0)
      return { dataReturn, nonce: user.userWallet.nonce };
  }

  async editSaleNft(saleId: number, editOrderDto: EditOrderDto, user: User) {
    try {
      const saleNft = await this.saleNftRepository.findOne({
        where: {
          id: saleId,
          action: SaleNftType.PUT_ON_SALE,
          status: SaleNftStatus.SUCCESS,
          fromUser: { id: user.id },
          nft: {
            marketStatus: NFT_MARKET_STATUS.ON_FIX_PRICE,
          },
        },
        relations: [
          'nft',
          'nft.network',
          'nft.collections',
          'nft.collections.network',
          'nft.user',
        ],
      });

      if (saleNft) {
        editOrderDto.receiveToken = saleNft.receiveToken;
        const nft = await this.nftsRepository.findOne({
          relations: ['network', 'collections', 'collections.network', 'user'],
          where: { id: saleNft.nft.id },
        });
        if (nft.status !== NftStatus.DONE) {
          throw new BadRequestException(
            CustomErrorMessage['NFT.NFT_STATUS_WRONG'],
          );
        }

        const network = await this.networkService.findOne(nft.networkId);
        editOrderDto.toUser = {
          id: saleNft.toUser.id,
          userName: saleNft.toUser.userName,
        };
        editOrderDto.nftId = saleNft.nft.id;
        editOrderDto.orderId = saleNft.orderId;
        editOrderDto.small_image = saleNft.nft.smallImage;
        let result: SaleNft;
        if (user.userWallet.type === 0) {
          result = await this.saleNftRepository.save(
            await editOrderDto.toEntity(),
          );
        } else {
          result = await editOrderDto.toEntity();
        }

        const dataReturn = await this.broadcastTransaction(
          result,
          network,
          user.userWallet.type,
          true,
        );
        if (user.userWallet.type > 0)
          return { dataReturn, nonce: user.userWallet.nonce };
      } else {
        return { status: false, message: CustomErrorMessage.SALE_ID_INVALID };
      }
    } catch (error) {
      console.log(error);
    }
  }
  async getTemporarySale(nft): Promise<SaleNft> {
    const result = await this.saleNftRepository.find({
      where: {
        nft: { id: nft.id },
      },
    });
    if (result.length > 0) {
      return result[0];
    }
    return null;
  }

  async cancelPutOnSale(saleNftId: number, user: User) {
    const saleNft = await this.saleNftRepository.find({
      id: saleNftId,
      fromUser: { id: user.id },
      status: SaleNftStatus.SUCCESS,
      action: SaleNftType.PUT_ON_SALE,
    });

    if (saleNft.length > 0) {
      const nft = await this.nftsRepository.findOne({
        relations: ['network', 'collections', 'collections.network', 'user'],
        where: { id: saleNft[0].nft.id },
      });

      if (nft.status !== NftStatus.DONE) {
        throw new BadRequestException(
          CustomErrorMessage['NFT.NFT_STATUS_WRONG'],
        );
      }

      const data = new SaleNft();
      data.action = SaleNftType.CANCEL_SALE_NFT;
      data.fromUser = { id: user.id, userName: user.userName };
      data.toUser = { id: user.id, userName: user.userName };
      data.nft = saleNft[0].nft;
      data.receiveToken = saleNft[0].receiveToken;
      data.orderId = saleNft[0].orderId;
      data.quantity = saleNft[0].quantity;
      let result: SaleNft;
      if (user.userWallet.type === 0) {
        result = await this.saleNftRepository.save(data);
      } else {
        result = data;
      }
      const network = await this.networkService.findOne(nft.networkId);
      const dataReturn = await this.broadcastTransaction(
        result,
        network,
        user.userWallet.type,
      );

      return { dataReturn, nonce: user.userWallet.nonce };
    } else {
      throw new BadRequestException(
        CustomErrorMessage['SALE_NFT_INVALID_NFT_ID'],
      );
    }
  }

  async buyNft(createSaleNftDto: BuyOrAcceptNft, user: User) {
    const saleNft = await this.saleNftRepository.findOneSaleNft(
      createSaleNftDto.saleNftId,
      SaleNftType.PUT_ON_SALE,
    );
    if (saleNft.length > 0 && saleNft[0].toUser.id !== user.id) {
      createSaleNftDto.receiveToken = saleNft[0].receiveToken;
      const nft = await this.nftsRepository.findOne({
        relations: ['network', 'collections', 'collections.network', 'user'],
        where: { id: saleNft[0].nft.id },
      });
      if (nft.status !== NftStatus.DONE) {
        throw new BadRequestException(
          CustomErrorMessage['NFT.NFT_STATUS_WRONG'],
        );
      }
      if (nft.isAuction == NftType.AUCTION) {
        throw new BadRequestException(CustomErrorMessage['NFT.IS_AUTION']);
      }

      if (
        createSaleNftDto.quantity > saleNft[0].quantity ||
        createSaleNftDto.quantity <= 0
      ) {
        throw new BadRequestException(
          CustomErrorMessage['SALE_NFT_INVALID_QUANTITY'],
        );
      }
      if (
        createSaleNftDto.quantity + saleNft[0].successQuantity >
        saleNft[0].quantity
      ) {
        throw new BadRequestException(
          CustomErrorMessage['SALE_NFT_QUANTITY_GREATER_THAN_STOCK_QUANTITY'],
        );
      }

      const network = await this.networkService.findOne(nft.networkId);
      createSaleNftDto.toUser = {
        id: saleNft[0].toUser.id,
        userName: saleNft[0].toUser.userName,
      };
      createSaleNftDto.price = Number(saleNft[0].price);
      const balance = await this.marketBlockchainService.getBalance(
        user.userWallet.address,
        createSaleNftDto.receiveToken,
        network,
      );

      let fee = 0;
      if (user.userWallet.type === 0) {
        fee = 0.01;
      }
      if (
        balance <
        createSaleNftDto.price * createSaleNftDto.quantity * 1.025 + 0.01
      ) {
        throw new BadRequestException(
          CustomErrorMessage['SALE_NFT_BALANCE_NOT_ENOUGH'],
        );
      }

      createSaleNftDto.nftId = saleNft[0].nft.id;
      createSaleNftDto.orderId = saleNft[0].orderId;
      createSaleNftDto.small_image = saleNft[0].nft.smallImage;
      let result: SaleNft;
      if (user.userWallet.type === 0) {
        result = await this.saleNftRepository.save(
          await createSaleNftDto.toEntity(),
        );
      } else {
        result = await createSaleNftDto.toEntity();
      }
      const dataReturn = await this.broadcastTransaction(
        result,
        network,
        user.userWallet.type,
        false,
      );
      if (dataReturn) {
        const toUserWalletInfo = await this.userRepository.findOne(
          saleNft[0].toUser.id,
        );
        // send socket
        const data = createSocketData(
          null,
          [saleNft[0].toUser.id],
          SOCKET_EVENT.BUY_NFT,
          saleNft[0].nft.id,
          result.id,
          [toUserWalletInfo.userWallet.address],
        );
        sendToSocket(data, SOCKET_EVENT.BUY_NFT);
      }
      if (user.userWallet.type > 0)
        return { dataReturn, nonce: user.userWallet.nonce };
    } else {
      throw new BadRequestException(
        CustomErrorMessage['SALE_NFT_INVALID_SALE_NFT_ID'],
      );
    }
  }

  async broadcastTransaction(
    saleNft: SaleNft,
    network: Network,
    walletType: number,
    isUpdate = false,
    royalty = 0,
    listOrderId = [],
    isAcceptHasPutSale = 3,
  ) {
    let start = 1;
    let resultData = null;
    const fromUserWalletInfo = await this.userRepository
      .createQueryBuilder('user')
      .where('user.id = :id', { id: saleNft.fromUser.id })
      .innerJoinAndSelect('user.userWallet', 'userWallet')
      .addSelect('userWallet.privateKeyEncryptedValue')
      .getOne();
    while (start < 6) {
      let tx;
      console.log(
        `saleNftService::broadcastTransaction process for record id=${saleNft.id} type=${saleNft.action}`,
      );
      try {
        let privateKeyFromUser = '';
        if (walletType === 0) {
          privateKeyFromUser = await decrypt(
            fromUserWalletInfo.userWallet.privateKeyEncryptedValue,
          );
        }
        let approveAllData = null;
        const nft = await this.nftsRepository.findOne({
          relations: ['network', 'collections', 'collections.network', 'user'],
          where: { id: saleNft.nft.id },
        });

        if (
          [SaleNftType.PUT_ON_SALE, SaleNftType.BURN_NFT, SaleNftType.PUT_AUCTION, SaleNftType.ACCEPT_NFT].includes(
            saleNft.action,
          )
        ) {
          if (
            !(await this.marketBlockchainService.isApprovedForAll(
              fromUserWalletInfo.userWallet.address,
              nft.collections,
              network,
            ))
          ) {
            approveAllData =
              await this.marketBlockchainService.setApprovalForAll(
                fromUserWalletInfo.userWallet.address,
                nft.collections,
                network,
                walletType,
              );
          }
        }

        if (saleNft.action === SaleNftType.PUT_ON_SALE && !isUpdate) {
          // put-on-sale
          tx = await this.marketBlockchainService.createOrder(
            fromUserWalletInfo.userWallet.address,
            nft.tokenId,
            saleNft.quantity,
            saleNft.price,
            saleNft.receiveToken,
            privateKeyFromUser,
            nft.collections.contractAddress || network.xanaliaDexContract,
            walletType,
            network,
          );
        }

        if (saleNft.action === SaleNftType.MAKE_OFFER && !isUpdate) {
          tx = await this.marketBlockchainService.createBid(
            fromUserWalletInfo.userWallet.address,
            nft.tokenId,
            saleNft.quantity,
            saleNft.price,
            saleNft.receiveToken,
            privateKeyFromUser,
            nft.collections.contractAddress,
            walletType,
            network,
            saleNft.expired,
          );
        }

        if (saleNft.action === SaleNftType.PUT_ON_SALE && isUpdate) {
          // edit-order
          tx = await this.marketBlockchainService.editOrder(
            saleNft.orderId,
            saleNft.price,
            saleNft.receiveToken,
            fromUserWalletInfo.userWallet.address,
            privateKeyFromUser,
            walletType,
            network,
          );
        }

        if (saleNft.action === SaleNftType.CANCEL_SALE_NFT) {
          // cancel-put-on-sale
          tx = await this.marketBlockchainService.cancelOrder(
            saleNft.orderId,
            saleNft.receiveToken,
            fromUserWalletInfo.userWallet.address,
            privateKeyFromUser,
            walletType,
            network,
          );
        }

        if (saleNft.action === SaleNftType.CANCEL_MAKE_OFFER) {
          tx = await this.marketBlockchainService.cancelBid(
            saleNft.orderId,
            saleNft.receiveToken,
            fromUserWalletInfo.userWallet.address,
            privateKeyFromUser,
            walletType,
            network,
          );
        }

        if (saleNft.action === SaleNftType.BUY_NFT) {
          // buy nft
          tx = await this.marketBlockchainService.buy(
            saleNft.orderId,
            saleNft.quantity,
            saleNft.receiveToken,
            saleNft.quantity * saleNft.price,
            fromUserWalletInfo.userWallet.address,
            privateKeyFromUser,
            walletType,
            network,
            royalty,
          );
        }

        if (saleNft.action === SaleNftType.ACCEPT_NFT) {
          // accept bid nft
          tx = await this.marketBlockchainService.acceptBid(
            saleNft.orderId,
            saleNft.quantity,
            listOrderId,
            saleNft.receiveToken,
            fromUserWalletInfo.userWallet.address,
            privateKeyFromUser,
            walletType,
            network,
            nft.collections.contractAddress,
            +nft.tokenId,
            isAcceptHasPutSale,
          );
        }

        if (walletType > 0) return { ...tx, approveAllData };
      } catch (error) {
        // return "done"
        console.error(
          `TransactionService::processSaleNft process for record id=${saleNft.id
          } error=${error?.toString()}`,
          error,
        );
        this.logger.error(`Error on [broadcastTransaction]`, error);
        start++;
        start === 6 ? (resultData = error?.toString()) : (resultData = null);
        throw new Error(error);
        // await updateTransaction(request._id, { status: Const.transaction.status.pending })
      }
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
    if (start === 6) {
      await this.marketBlockchainService.updateFailSaleNft(saleNft);
      throw new BadRequestException(resultData);
    }
    return resultData;
  }

  async getListBidHistory(dto: BidHistory) {
    try {
      const query = this.saleNftRepository
        .createQueryBuilder('saleNft')
        .addSelect([
          'fromUser.id',
          'fromUser.userName',
          'fromUser.email',
          'toUser.id',
          'toUser.userName',
          'toUser.email',
        ])
        .leftJoinAndSelect('saleNft.auctionSession', 'auctionSession')
        .leftJoin('saleNft.fromUser', 'fromUser')
        .leftJoin('saleNft.toUser', 'toUser')
        .leftJoinAndSelect('fromUser.userWallet', 'fromUserWallet')
        .leftJoinAndSelect('toUser.userWallet', 'toUserWallet')
        .where('saleNft.nft_id = :nftId', { nftId: dto.nftId })
        .andWhere('saleNft.action = :action', { action: SaleNftType.BID_NFT })
        .andWhere('saleNft.status IN (:status)', {
          status: [SaleNftStatus.SUCCESS, SaleNftStatus.MAKE_OFFER_EXPIRED],
        })
        .limit(dto.limit)
        .offset(dto.limit * (dto.page - 1));

      // SORT
      switch (dto.sort) {
        case SearchSort.NEWEST:
          query.orderBy('saleNft.created_at', 'DESC');
          break;
        case SearchSort.OLDEST:
          query.orderBy('saleNft.created_at', 'ASC');
          break;
        case SearchSort.PRICE_DESC:
          query.orderBy('saleNft.price', 'DESC');
          break;
        case SearchSort.PRICE_ASC:
          query.orderBy('saleNft.price', 'ASC');
          break;
        default:
          query.orderBy('saleNft.id', 'DESC');
      }

      const [items, total] = await Promise.all([
        query.getMany(),
        query.getCount(),
      ]);
      return new Pagination<any>(items, {
        itemCount: items.length,
        totalItems: total,
        currentPage: dto.page,
        itemsPerPage: dto.limit,
        totalPages: Math.ceil(total / dto.limit),
      });
    } catch (error) {
      console.log(error);
    }
  }

  async getListTradingHistory(dto: TradingHistory) {
    try {
      const query = this.saleNftRepository
        .createQueryBuilder('saleNft')
        .addSelect([
          'fromUser.id',
          'fromUser.userName',
          'fromUser.email',
          'toUser.id',
          'toUser.userName',
          'toUser.email',
          'nft.id',
          'nft.name',
          'nft.tokenId',
          'nft.previewImage',
          'nft.smallImage',
          'network.name',
          'network.id',
          'collections.id',
          'collections.contractAddress',
        ])
        .leftJoin('saleNft.fromUser', 'fromUser')
        .leftJoin('saleNft.toUser', 'toUser')
        .leftJoinAndSelect('fromUser.userWallet', 'fromUserWallet')
        .leftJoinAndSelect('toUser.userWallet', 'toUserWallet')
        .leftJoin('saleNft.nft', 'nft')
        .leftJoin('nft.network', 'network')
        .leftJoin('nft.collections', 'collections')
        .where('saleNft.status IN (:status)', {
          status: [
            SaleNftStatus.SUCCESS,
            SaleNftStatus.NOT_COUNT,
            SaleNftStatus.MAKE_OFFER_EXPIRED,
          ],
        });

      if (dto.collectionId) {
        query.andWhere('collections.id = :collectionId', {
          collectionId: dto.collectionId,
        });
      } else if (dto.nftId) {
        query.andWhere('saleNft.nft_id = :nftId', { nftId: dto.nftId });
      }

      let actionDefault = [
        SaleNftType.MINT_NFT,
        // Fix price
        SaleNftType.PUT_ON_SALE,
        SaleNftType.MAKE_OFFER,
        SaleNftType.CANCEL_MAKE_OFFER,
        SaleNftType.RECLAIM_MAKE_OFFER,
        SaleNftType.CANCEL_SALE_NFT,
        SaleNftType.EDIT_ORDER,
        SaleNftType.BUY_NFT,
        SaleNftType.ACCEPT_NFT,
        // Auction
        SaleNftType.PUT_AUCTION,
        SaleNftType.CANCEL_AUCTION,
        SaleNftType.BID_NFT,
        SaleNftType.BID_EDITED,
        SaleNftType.CANCEL_BID_NFT,
        SaleNftType.RECLAIM_BID_NFT,
        SaleNftType.WINNER_BID_NFT,
        SaleNftType.ACCEPT_BID_NFT,
        SaleNftType.RECLAIM_NFT,
      ];
      let actions = [];
      if (dto.sort?.length) {
        dto.sort.forEach((e) => {
          if (actionDefault.includes(e)) {
            actions.push(e);
          }
        });
      } else {
        actions = actionDefault;
      }
      query
        .andWhere('saleNft.action IN (:actions)', {
          actions,
        })
        .limit(dto.limit)
        .offset(dto.limit * (dto.page - 1))
        .orderBy('saleNft.id', 'DESC');

      const [items, total] = await Promise.all([
        query.getMany(),
        query.getCount(),
      ]);

      return new Pagination<any>(items, {
        itemCount: items.length,
        totalItems: total,
        currentPage: dto.page,
        itemsPerPage: dto.limit,
        totalPages: Math.ceil(total / dto.limit),
      });
    } catch (error) {
      console.log(error);
    }
  }

  async exchangeRateCoin(fromCoin: string, toCoin: string) {
    return this.rateCoinService.exchangeRateCoin(fromCoin, toCoin);
  }
}
