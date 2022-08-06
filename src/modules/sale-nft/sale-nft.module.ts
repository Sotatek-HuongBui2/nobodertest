import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SaleNftRepository } from './sale-nft.repository';
import { Nfts } from '../nfts/entities/nfts.entity';
import { SaleNftController } from './sale-nft.controller';
import { SaleNftService } from './sale-nft.service';
import { NftsModule } from '../nfts/nfts.module';
import { User } from '../users/entities/user.entity';
import { OwnerNft } from '../owner-nft/entities/owner-nft.entity';
import { UserWallet } from '../user-wallet/entities/user-wallet.entity';
import { UserModule } from '../users/user.module';
import { NetworkModule } from '../networks/network.module';
import { NetworkTokensModule } from '../network-tokens/network-token.module';
import { MarketBlockchainService } from '../blockchains/market-blockchain.service';
import { AuctionSessionModule } from '../auction-session/auction-session.module';
import { SaleNftAuctionController } from './sale-nft-auction.controller';
import { AuctionMarketBlockchainService } from '../blockchains/auction-market-blockchain.service';
import { SaleNftAuctionService } from './sale-nft-auction.service';
import { OwnerNftModule } from '../owner-nft/owner-nft.module';
import { RateCoinModule } from '../rateCoins/rate-coin.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SaleNftRepository,
      Nfts,
      User,
      OwnerNft,
      UserWallet,
    ]),
    forwardRef(() => NftsModule),
    forwardRef(() => UserModule),
    NetworkModule,
    NetworkTokensModule,
    forwardRef(() => AuctionSessionModule),
    OwnerNftModule,
    RateCoinModule,
  ],
  providers: [
    SaleNftService,
    SaleNftAuctionService,
    MarketBlockchainService,
    AuctionMarketBlockchainService,
  ],
  controllers: [SaleNftController, SaleNftAuctionController],
  exports: [
    SaleNftService,
    SaleNftAuctionService,
    MarketBlockchainService,
    AuctionMarketBlockchainService,
  ],
})
export class SaleNftModule {}
