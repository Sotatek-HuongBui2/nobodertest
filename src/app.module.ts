import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { CollectionsModule } from './modules/collections/collections.module';
import { UserModule } from './modules/users/user.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { NftsModule } from './modules/nfts/nfts.module';
import { SaleNftModule } from './modules/sale-nft/sale-nft.module';
import { ExternalTransactionsModule } from './modules/external-transaction/external-transactions.module';
import { AuctionSessionModule } from './modules/auction-session/auction-session.module';
import { AdminModule } from './modules/admin/admin.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { MailModule } from './modules/mail/mail.module';
import { TwitterStrategy } from './modules/auth/strategies/twitte.strategy';
import { UserRepository } from './modules/users/user.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserRepository]),
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot(),
    UserModule,
    AuthModule,
    CollectionsModule,
    CategoriesModule,
    NftsModule,
    ExternalTransactionsModule,
    SaleNftModule,
    AuctionSessionModule,
    AdminModule,
    MailModule,
    MailerModule.forRoot({
      transport: {
        host: process.env.MAIL_HOST,
        port: process.env.MAIL_PORT,
        secure: true,
        auth: {
          user: process.env.MAILDEV_INCOMING_USER,
          pass: process.env.MAILDEV_INCOMING_PASS,
        },
        debug: true,
      },
    }),
    {
      ...JwtModule.register({
        secret: process.env.JWT_SECRET_KEY,
        signOptions: { expiresIn: process.env.JWT_EXPIRED_TOKEN_AFTER },
      }),
      global: true,
    },
  ],
  controllers: [AppController],
  providers: [AppService, TwitterStrategy],
})
export class AppModule { }
