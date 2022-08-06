import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NetworkModule } from '../networks/network.module';
import { ArtistRepository } from './artist.repository';
import { ArtistService } from './artist.service';

@Module({
  imports: [TypeOrmModule.forFeature([ArtistRepository]), NetworkModule],
  controllers: [],
  providers: [
    ArtistService
  ],
  exports: [ArtistService]
})
export class ArtistModule { }
