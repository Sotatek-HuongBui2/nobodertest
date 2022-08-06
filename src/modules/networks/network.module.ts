import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NetworkController } from './network.controller';
import { NetworkRepository } from './network.repository';
import { NetworkService } from './network.service';

@Module({
  imports: [TypeOrmModule.forFeature([NetworkRepository])],
  controllers: [NetworkController],
  providers: [NetworkService],
  exports: [NetworkService],
})
export class NetworkModule {}
