import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { UserModule } from '../users/user.module';
import { UserRepository } from '../users/user.repository';
import { WhitelistUserModule } from '../whitelist-user/whitelist-user.module';
import { WhitelistUserRepository } from '../whitelist-user/whitelist-user.repository';
import { AuthModule } from '../auth/auth.module';
// import { Artist } from '../artist/entities/artist.entity';
import { ArtistModule } from '../artist/artist.module';
import { ArtistRepository } from '../artist/artist.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserRepository, WhitelistUserRepository, ArtistRepository
    ]),
    WhitelistUserModule,
    AuthModule,
    UserModule,
    ArtistModule
  ],
  controllers: [AdminController],
  providers: [
    AdminService
  ],
})
export class AdminModule { }
