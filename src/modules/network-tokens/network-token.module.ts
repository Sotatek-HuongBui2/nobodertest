import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NetworkTokensRepository } from 'src/modules/network-tokens/network-token.repository';
import { NetworkTokensController } from 'src/modules/network-tokens/network-token.controller';
import { NetworkTokensService } from 'src/modules/network-tokens/network-tokens.service';

@Module({
  imports: [TypeOrmModule.forFeature([NetworkTokensRepository])],
  controllers: [NetworkTokensController],
  providers: [NetworkTokensService],
  exports: [NetworkTokensService],
})
export class NetworkTokensModule {}
