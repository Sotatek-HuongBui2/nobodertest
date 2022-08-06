import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuctionSessionRepository } from 'src/modules/auction-session/auction-session.repository';
import { AuctionSessionController } from 'src/modules/auction-session/auction-session.controller';
import { AuctionSessionService } from 'src/modules/auction-session/auction-session.service';
import { OwnerNftModule } from '../owner-nft/owner-nft.module';
import { NftsRepository } from '../nfts/nfts.repository';
import { NetworkService } from '../networks/network.service';
import { NetworkRepository } from '../networks/network.repository';
import { UserRepository } from '../users/user.repository';
import { NftsModule } from 'src/modules/nfts/nfts.module';
import { SaleNftModule } from 'src/modules/sale-nft/sale-nft.module';
import { UserModule } from '../users/user.module';
import { AuctionBlockchainService } from '../blockchains/auction-blockchain.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AuctionSessionRepository,
      NftsRepository,
      NetworkRepository,
      UserRepository,
    ]),
    OwnerNftModule,
    forwardRef(() => SaleNftModule),
    forwardRef(() => NftsModule),
    forwardRef(() => UserModule),
  ],
  controllers: [AuctionSessionController],
  providers: [AuctionSessionService, AuctionBlockchainService, NetworkService],
  exports: [AuctionSessionService],
})
export class AuctionSessionModule {}
