import { Body, Controller, Get, HttpException, HttpStatus, Post, Query, Redirect, UseGuards, } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags } from '@nestjs/swagger';
import { LoginExternalDto } from './dto/login-external.dto';
import { UserService } from '../users/user.service';
import { NftsService } from '../nfts/nfts.service';
import { CustomErrorMessage } from 'src/common/constants/error-message';
import { IsNonCrypto } from '../users/enums';
import { TwitterAuthGuard } from './guards/twitter-auth.guard';
import { UserScope } from 'src/common/decorators/user.decorator';
import { User } from 'aws-sdk/clients/iam';
import { RefreshTokenDto } from './dto/refresh-token';
import { User as UserEntity } from '../users/entities/user.entity'

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private userService: UserService,
    private nftService: NftsService
  ) { }

  @Get('get-nonce')
  async getNonce(@Query('address') address: string) {
    return this.authService.getNonce(address);
  }

  @Post('login-external-wallet')
  async loginExternalWallet(@Body() loginExternalDto: LoginExternalDto) {
    let userData = null as UserEntity | null

    const userWithAddress = await this.authService.getUser(loginExternalDto.address, loginExternalDto.signature);
    if (!!userWithAddress) {
      if (userWithAddress.isNonCrypto == IsNonCrypto.TRUE) {
        if (!loginExternalDto.email || loginExternalDto.email != userWithAddress.email) {
          throw new HttpException(CustomErrorMessage['USER.USER_WITH_EMAIL_NOT_EXIST'], HttpStatus.BAD_REQUEST);
        }
      } else if (userWithAddress.isNonCrypto == IsNonCrypto.FALSE) {
        if (loginExternalDto.address.toUpperCase() != userWithAddress.userWallet.address.toUpperCase()) {
          throw new HttpException(CustomErrorMessage['USER.USER_WITH_EMAIL_NOT_EXIST'], HttpStatus.BAD_REQUEST);
        }
      }
      userData = userWithAddress
    }

    if (!userData && !!loginExternalDto.email) {
      const userWithEmail = await this.authService.getUserByEmail(loginExternalDto.email)
      if (!!userWithEmail && !!userWithEmail.userWallet) {
        if (userWithEmail.userWallet.address.toUpperCase() != loginExternalDto.address.toUpperCase()) {
          throw new HttpException(CustomErrorMessage['USER.USER_WITH_EMAIL_ALREADY_EXIST'], HttpStatus.BAD_REQUEST);
        }
        userData = userWithEmail
      } else if (!!userWithEmail && !userWithEmail.userWallet) {
        userData = await this.userService.updateNewWalletUser(userWithEmail, loginExternalDto.address)
      }
    }

    if (!userData) {
      const newUser = this.authService.initNewUser(loginExternalDto);
      userData = await this.userService.registerExternalWallet(newUser);
    }

    const access_token = await this.authService.login(userData);
    const refresh_token = await this.authService.getRefreshToken(userData)

    if (process.env.UPDATE_NFT_BY_MORALIS) {
      this.nftService.updateNFTForLoginedUser(userData)
    }

    return { access_token, refresh_token, user: userData }
  }

  @Post('refresh-token')
  async refreshToken(@Body() refreshToken: RefreshTokenDto) {
    try {
      const token = await this.authService.decodeToken(refreshToken.token) as any
      const refresh_token = await this.authService.verifyToken(
        refreshToken.refreshToken,
        process.env.JWT_SECRET_REFRESH_TOKEN_KEY
      ) as any

      if (
        !token ||
        !refresh_token ||
        new Date().getTime() < refresh_token.exp ||
        token.sub !== refresh_token.sub
      ) {
        return null
      }

      const user = await this.userService.findUser(refresh_token.sub)
      const newToken = await this.authService.login(user[0])
      return { newToken }
    } catch (error) {
      return null
    }
  }

  @Get('/twitter/callback')
  @Redirect(`${process.env.FE_DOMAIN}/profile/account`)
  @UseGuards(TwitterAuthGuard)
  async twiiterLogginRedict(@UserScope() user: User, @Query('oauth_token') oauthToken: string, @Query('oauth_verifier') oauthVerifier: string): Promise<any> {
    return user;
  }

  @Get('/twitter')
  @UseGuards(TwitterAuthGuard)
  async twiiter() {
  }
}
