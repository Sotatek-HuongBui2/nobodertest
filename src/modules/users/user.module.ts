import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IsEmailCustomConstraint } from 'src/common/decorators/is-email.decorator';
import { IsEmailNormalUserNotExistConstraint } from 'src/common/decorators/not-exist-email-range-normal-user.decorator';
import { IsAddressNotExistConstraint } from 'src/common/decorators/not-exist-address.decorator';
import { User } from './entities/user.entity';
import { UserController } from './user.controller';
import { UserRepository } from './user.repository';
import { UserService } from './user.service';
import { IsExistReferralCodeConstraint } from 'src/common/decorators/exit-referral-code.decorator';
import { CollectionsModule } from '../collections/collections.module';
import { WhitelistUserModule } from '../whitelist-user/whitelist-user.module';
import { WhitelistUserRepository } from '../whitelist-user/whitelist-user.repository';
import { ArtistModule } from '../artist/artist.module';
import { MailModule } from '../mail/mail.module';
import { NftsModule } from '../nfts/nfts.module';
import { UserLikeNft } from '../user-like-nft/entities/user-like-user.entity';
import { NftsRepository } from '../nfts/nfts.repository';
import { CollectionsRepository } from '../collections/collections.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      UserRepository,
      WhitelistUserRepository,
      UserLikeNft,
      NftsRepository,
      CollectionsRepository,
    ]),
    CollectionsModule,
    WhitelistUserModule,
    ArtistModule,
    MailModule,
  ],
  controllers: [UserController],
  providers: [
    UserService,
    IsEmailCustomConstraint,
    IsEmailNormalUserNotExistConstraint,
    IsAddressNotExistConstraint,
    IsExistReferralCodeConstraint,
  ],
  exports: [UserService],
})
export class UserModule {}
