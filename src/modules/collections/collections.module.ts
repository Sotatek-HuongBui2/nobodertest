import { forwardRef, Module } from '@nestjs/common';
import { CollectionsService } from './collections.service';
import { CollectionsController } from './collections.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CollectionsRepository } from './collections.repository';
import { NetworkModule } from '../networks/network.module';
import { NftsModule } from '../nfts/nfts.module';
import { AuctionSessionModule } from '../auction-session/auction-session.module';
import { BlockchainsModule } from '../blockchains/blockchains.module';
import { NftsRepository } from '../nfts/nfts.repository';
import { NetworkRepository } from '../networks/network.repository';
import { UserRepository } from '../users/user.repository';
import { SaleNftRepository } from '../sale-nft/sale-nft.repository';
import { OwnerNftRepository } from '../owner-nft/owner-nft.repository';
import { RateCoinModule } from '../rateCoins/rate-coin.module';
import { CollectionLaunchpadRepository } from './collection-launchpad.repository';
import { CollectionLaunchpadService } from './collection-launchpad.service';
import { CollectionLaunchpadController } from './collection-launchpad.controller';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      CollectionsRepository,
      CollectionLaunchpadRepository,
      NftsRepository,
      NetworkRepository,
      UserRepository,
      SaleNftRepository,
      OwnerNftRepository,
    ]),
    NetworkModule,
    BlockchainsModule,
    RateCoinModule,
    AuctionSessionModule,
    forwardRef(() => NftsModule),
  ],
  controllers: [CollectionsController, CollectionLaunchpadController],
  providers: [CollectionsService, CollectionLaunchpadService],
  exports: [CollectionsService, CollectionLaunchpadService],
})
export class CollectionsModule {}
