import { forwardRef, Module } from '@nestjs/common';
import { NftsService } from './nfts.service';
import { NftsController } from './nfts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NftsRepository } from './nfts.repository';
import { UserModule } from '../users/user.module';
import { Collection } from '../collections/entities/collections.entity';
import { NetworkModule } from '../networks/network.module';
import { NetworkTokensModule } from '../network-tokens/network-token.module';
import { CategoriesModule } from '../categories/categories.module';
import { CollectionsModule } from '../collections/collections.module';
import { BlockchainsModule } from '../blockchains/blockchains.module';
import { AuctionSessionModule } from '../auction-session/auction-session.module';
import { MarketBlockchainService } from '../blockchains/market-blockchain.service';
import { SaleNftModule } from '../sale-nft/sale-nft.module';
import { SaleNftRepository } from '../sale-nft/sale-nft.repository';
import { UserRepository } from '../users/user.repository';
import { OwnerNftModule } from '../owner-nft/owner-nft.module';
import { OwnerNftRepository } from '../owner-nft/owner-nft.repository';
import { CollectionsRepository } from '../collections/collections.repository';
import { NetworkRepository } from '../networks/network.repository';
import { UserLikeNft } from '../user-like-nft/entities/user-like-user.entity';
import { RateCoinModule } from '../rateCoins/rate-coin.module';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      NftsRepository,
      Collection,
      SaleNftRepository,
      UserRepository,
      OwnerNftRepository,
      CollectionsRepository,
      NetworkRepository,
      UserLikeNft,
    ]),
    forwardRef(() => SaleNftModule),
    forwardRef(() => UserModule),
    NetworkModule,
    NetworkTokensModule,
    CategoriesModule,
    forwardRef(() => CollectionsModule),
    forwardRef(() => BlockchainsModule),
    AuctionSessionModule,
    OwnerNftModule,
    RateCoinModule,
    RedisModule,
  ],
  controllers: [NftsController],
  providers: [NftsService, MarketBlockchainService],
  exports: [NftsService, MarketBlockchainService],
})
export class NftsModule {}
