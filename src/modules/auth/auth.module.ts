import { HttpModule, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../users/user.module';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserWallet } from 'src/modules/user-wallet/entities/user-wallet.entity';
import { JwtStrategy } from './strategies/jwt.strategy';
import { NftsModule } from '../nfts/nfts.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserWallet]),
    ConfigModule,
    HttpModule,
    UserModule,
    PassportModule,
    NftsModule
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    ConfigService,
    JwtStrategy
  ],
  exports: [AuthService],
})
export class AuthModule { }
