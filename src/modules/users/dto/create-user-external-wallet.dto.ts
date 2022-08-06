import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Length } from 'class-validator';
import * as shortid from 'shortid';

import { User } from '../entities/user.entity';
import { UserWallet } from '../../../modules/user-wallet/entities/user-wallet.entity';
import { userStatus } from '../../../modules/auth/enums';

import { IsExistInviteCode } from 'src/common/decorators/exit-referral-code.decorator';
import { IsNotExistAddress } from 'src/common/decorators/not-exist-address.decorator';
import { IsNotExistEmailRangeNorMalUser } from 'src/common/decorators/not-exist-email-range-normal-user.decorator';
import { IsEmailCustom } from 'src/common/decorators/is-email.decorator';

export class CreateExternalWalletUserDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Length(1, 32)
  //@IsNotExistUserNameRangeNorMalUser()
  userName: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  @IsEmailCustom()
  @IsNotExistEmailRangeNorMalUser()
  email: string;

  @ApiProperty({ required: true })
  @IsOptional()
  @IsString()
  @IsExistInviteCode()
  inviteCode: string;

  @ApiProperty({ required: true })
  @IsNumber()
  type: number;

  @ApiProperty({ required: true })
  @IsString()
  @IsNotExistAddress()
  address: string;

  @ApiProperty({ required: true })
  @IsString()
  signature: string;

  async toEntity(): Promise<User> {
    const user = new User();
    user.userName = this.userName;
    user.email = this.email || '';
    user.inviteCode = shortid.generate();
    user.userWallet = new UserWallet();
    user.status = userStatus.ACTIVE;
    user.userWallet.address = this.address.toLowerCase();
    user.userWallet.type = this.type;
    return user;
  }

  async toObjectUpdate() {
    return {
      userName: this.userName,
      email: this.email || '',
      inviteCode: shortid.generate(),
      status: userStatus.ACTIVE,
    };
  }
}
