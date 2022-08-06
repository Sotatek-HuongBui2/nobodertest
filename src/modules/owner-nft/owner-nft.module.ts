import { Module } from '@nestjs/common';
import { OwnerNftService } from './owner-nft.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OwnerNftRepository } from 'src/modules/owner-nft/owner-nft.repository';

@Module({
  imports: [TypeOrmModule.forFeature([OwnerNftRepository])],
  controllers: [],
  providers: [OwnerNftService],
  exports: [OwnerNftService],
})
export class OwnerNftModule {}
