import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UserService } from '../users/user.service';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/modules/users/entities/user.entity';
import { recoverSignature, recoverSignatureAdmin } from '../../common/utility/recoverSignature';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserWallet } from 'src/modules/user-wallet/entities/user-wallet.entity';
import { CreateExternalWalletUserDto } from '../users/dto/create-user-external-wallet.dto';
import { CustomErrorMessage } from 'src/common/constants/error-message';
import { userType } from '../users/enums';
import { Role } from 'src/common/decorators/roles.decorator';
import { LoginExternalDto } from './dto/login-external.dto';

export interface JWTPayload {
  sub: number;
  username: string;
  walletType: number;
  nonce: number;
}


@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    @InjectRepository(UserWallet)
    private userWalletRepository: Repository<UserWallet>,
  ) { }

  async login(user: User) {
    const { id, userName } = user;
    const walletType = user?.userWallet?.type;
    const payload: JWTPayload = {
      sub: id,
      username: userName,
      walletType: walletType,
      nonce: user?.userWallet?.nonce,
    };

    return this.jwtService.sign(payload)
  }

  async getRefreshToken(user: User) {
    return this.jwtService.sign({ sub: user.id }, {
      secret: process.env.JWT_SECRET_REFRESH_TOKEN_KEY,
      expiresIn: process.env.JWT_EXPIRED_REFRESH_TOKEN_AFTER,
    })
  }

  async verifyToken(token: string, key: string) {
    try {
      return this.jwtService.verify(token, { secret: key })
    } catch (error) {
      return null
    }
  }

  async decodeToken(token: string) {
    try {
      return this.jwtService.decode(token)
    } catch (error) {
      return null
    }
  }

  async getNonce(address: string) {
    const userWallet = await this.userWalletRepository.findOne({ address: address });
    const userRepo = await this.userService.getRepository();
    const user = await userRepo.findOne({
      email: address,
    });
    if (userWallet && !user) {
      return userWallet.nonce;
    }
    return -1;
  }

  async updateNonce(address: string, nonce: number) {
    await this.userWalletRepository.update({ address: address }, { nonce: nonce + 1 });
  }

  async getUser(address: string, signature: string, role = Role.User) {
    const user = await this.findUserByAddress(address);
    if (!user) {
      // throw new UnauthorizedException();
      return null;
    }
    const nonce = await this.getNonce(user.userWallet.address);
    const recoverAddress = await recoverSignature(signature, user.userWallet.type, nonce);
    if (recoverAddress?.toLowerCase() !== address?.toLowerCase()) {
      throw new HttpException(CustomErrorMessage['USER.SIGNATURE_RECOVER_ADDRESS_NOT_MATCH'], HttpStatus.BAD_REQUEST);
    }
    return user;
  }

  async getUserByEmail(email: string) {
    const user = await this.userService.findByEmail(email)
    return user || null
  }

  async getUserAdmin(address: string, signature: string) {
    const user = await this.findUserByAddress(address);
    if (!user) {
      // throw new UnauthorizedException();
      return null;
    }
    const nonce = await this.getNonce(user.userWallet.address);
    const recoverAddress = await recoverSignatureAdmin(signature, user.userWallet.type, nonce);
    //console.log('recoverAddress:', recoverAddress);
    if (recoverAddress?.toLowerCase() !== address?.toLowerCase()) {
      throw new HttpException(CustomErrorMessage['USER.SIGNATURE_RECOVER_ADDRESS_NOT_MATCH'], HttpStatus.BAD_REQUEST);
    }
    if (user.role != Role.Admin) {
      throw new HttpException(CustomErrorMessage['ADMIN.WRONG_ROLE'], HttpStatus.UNAUTHORIZED);
    }
    // await this.updateNonce(address, nonce);
    return user;
  }

  async findUserByAddress(address: string) {
    return this.userService.findUserByAddress(address);
  }

  async getUserProfile(id: number) {
    const user = await this.userService.findUser(id)
    return user;
  }

  initNewUser(loginExternalDto: LoginExternalDto) {
    let newUser = new CreateExternalWalletUserDto();
    newUser.userName = "";
    newUser.type = userType.VERIFIED;
    newUser.address = loginExternalDto.address;
    newUser.signature = loginExternalDto.signature;
    newUser.email = loginExternalDto.email ? loginExternalDto.email : null
    return newUser;
  }
}
