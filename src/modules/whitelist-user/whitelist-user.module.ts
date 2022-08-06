import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NetworkModule } from '../networks/network.module';
import { SaleNftRepository } from '../sale-nft/sale-nft.repository';
import { WhitelistUserRepository } from './whitelist-user.repository';
import { WhitelistUserService } from './whitelist-user.service';

@Module({
  imports: [TypeOrmModule.forFeature([WhitelistUserRepository, SaleNftRepository]), NetworkModule],
  controllers: [],
  providers: [
    WhitelistUserService
  ],
  exports: [WhitelistUserService]
})
export class WhitelistUserModule { }
