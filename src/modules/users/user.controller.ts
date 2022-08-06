import { Body, ClassSerializerInterceptor, Controller, Get, Param, Post, Put, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserScope } from 'src/common/decorators/user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { MailService } from '../mail/mail.service';
import { RequestWhitelistDto } from './dto/approve-whitelist.dto';
import { CreateExternalWalletUserDto } from './dto/create-user-external-wallet.dto';
import { GetDetailUserDto } from './dto/get-detail-user.dto';
import { RequestArtistDto } from './dto/request-artist.dto';
import { UpdateImageDto } from './dto/update-image.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateVerifyEmailDto } from './dto/update-verify-email.dto';
import { UserLikeNftDto } from './dto/user-like-nft.dto';
import { VerifyUserDto } from './dto/verify-user.dto';
import { User } from './entities/user.entity';
import { UserService } from './user.service';

@ApiTags('user')
@Controller('users')
export class UserController {
  constructor(
    private userService: UserService,
    private mailService: MailService,
  ) { }

  @Post('register-external-wallet')
  @UseInterceptors(ClassSerializerInterceptor)
  async registerExternalWallet(@Body() createUserDto: CreateExternalWalletUserDto) {
    await this.userService.registerExternalWallet(createUserDto);
    return;
  }

  @Get('/search')
  async searchData(@Query('keyword') keyword: string) {
    return await this.userService.searchData(keyword)
  }

  @Get('/sign')
  async getSignature(@Query('private_key') privateKey: string, @Query('message') message: string) {
    return await this.userService.signMessage(privateKey, message);
  }

  @Get()
  async getAllUser() {
    return await this.userService.getAllUser()
  }

  @Get('/:address')
  async getUserDetail(@Param() getDetailUserDto: GetDetailUserDto) {
    return await this.userService.getUserDetail(getDetailUserDto)
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('request-whitelist')
  async requestWhitelist(@UserScope() user: User, @Body() requestWhitelistDto: RequestWhitelistDto) {
    return await this.userService.requestWhitelist(requestWhitelistDto.networkId, user);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('request-artist')
  async requestArtist(@UserScope() user: User, @Body() requestArtistDto: RequestArtistDto) {
    return await this.userService.requestArtist(user, requestArtistDto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Put('update-profile')
  async updateProfile(@UserScope() user: User, @Body() updateProfileDto: UpdateProfileDto) {
    return await this.userService.updateProfile(updateProfileDto, user)
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Put()
  async updateImage(@UserScope() user: User, @Body() updateImageDto: UpdateImageDto) {
    return await this.userService.updateImage(updateImageDto, user)
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('verify-email')
  async verifyEmail(@UserScope() user: User, @Body() verifyUserDto: VerifyUserDto) {
    const jwtVerify = await this.userService.createJwt(user);
    return this.mailService.send(verifyUserDto, jwtVerify)
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Put('disconnect-twitter')
  async disconnnectTwitter(@UserScope() user: User) {
    return await this.userService.disconnnectTwitter(user)
  }

  @Post('update-verify-email')
  async updateVerifyEmail(@UserScope() user: User, @Body() updateVerifyEmailDto: UpdateVerifyEmailDto) {
    return this.userService.updateVerifyEmail(updateVerifyEmailDto.accessToken)
  }
}

