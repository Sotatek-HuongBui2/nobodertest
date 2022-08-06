import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { UserScope } from 'src/common/decorators/user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { User } from 'src/modules/users/entities/user.entity';
import { SaleNftType } from './const';
import { SaleNftService } from './sale-nft.service';
import { CreateSaleNftDto } from './dto/create-sale-nft.dto';
import { CreateMakeOfferDto } from './dto/create-make-offer.dto';
import { BuyOrAcceptNft } from './dto/buy-nft.dto';
import { PagingDto } from './dto/paging-dto';
import { BidHistory } from './dto/bid-history.dto';
import { TradingHistory } from './dto/trading-history.dto';
import { EditOrderDto } from './dto/edit-order.dto';

@ApiTags('sale-nft')
@Controller('sale-nft')
export class SaleNftController {
  constructor(private readonly saleNftsService: SaleNftService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('put-on-sale')
  async createSaleNft(
    @Body() createSaleNftDto: CreateSaleNftDto,
    @UserScope() user: User,
  ) {
    createSaleNftDto.action = SaleNftType.PUT_ON_SALE;
    createSaleNftDto.fromUser = { id: user.id, userName: user.userName };
    createSaleNftDto.toUser = { id: user.id, userName: user.userName };
    return this.saleNftsService.putOnSale(createSaleNftDto, user);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Put()
  async EditSaleNft(
    @Query('saleId') saleId: number,
    @Body() editOrderDto: EditOrderDto,
    @UserScope() user: User,
  ) {
    editOrderDto.action = SaleNftType.PUT_ON_SALE;
    editOrderDto.fromUser = { id: user.id, userName: user.userName };
    editOrderDto.toUser = { id: user.id, userName: user.userName };
    return this.saleNftsService.editSaleNft(saleId, editOrderDto, user);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('cancel-put-on-sale')
  async removeSaleNft(@Query('id') id: number, @UserScope() user: User) {
    return this.saleNftsService.cancelPutOnSale(Number(id), user);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('make-offer')
  async createOfferNft(
    @Body() createMakeOfferDto: CreateMakeOfferDto,
    @UserScope() user: User,
  ) {
    createMakeOfferDto.action = SaleNftType.MAKE_OFFER;
    createMakeOfferDto.fromUser = { id: user.id, userName: user.userName };
    createMakeOfferDto.toUser = { id: user.id, userName: user.userName };
    return this.saleNftsService.makeOffer(createMakeOfferDto, user);
  }

  @ApiBearerAuth()
  @Get('offer-list/:nftId')
  async getListOffer(
    @Query() paging: PagingDto,
    @Param('nftId') nftId: number,
  ) {
    return this.saleNftsService.getListOffer(nftId, paging);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('cancel-make-offer')
  async cancelMakeOffer(@Query('id') id: number, @UserScope() user: User) {
    return this.saleNftsService.cancelMakeOffer(Number(id), user);
  }

  // @ApiBearerAuth()
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Post('update-make-offer')
  // async updateMakeOffer(
  //   @UserScope() user: User,
  //   @Body() updateMakeOfferDto: UpdateMakeOfferDto,
  // ) {
  //   updateMakeOfferDto.influencer = null;
  //   updateMakeOfferDto.influencerFee = 0;
  //   return this.saleNftsService.updateMakeOffer(updateMakeOfferDto, user);
  // }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('buy-nft')
  async buyNft(
    @Body() createSaleNftDto: BuyOrAcceptNft,
    @UserScope() user: User,
  ) {
    createSaleNftDto.action = SaleNftType.BUY_NFT;
    createSaleNftDto.fromUser = { id: user.id, userName: user.userName };
    return this.saleNftsService.buyNft(createSaleNftDto, user);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('accept-nft')
  async acceptNft(
    @Body() createSaleNftDto: BuyOrAcceptNft,
    @UserScope() user: User,
  ) {
    createSaleNftDto.action = SaleNftType.ACCEPT_NFT;
    createSaleNftDto.fromUser = { id: user.id, userName: user.userName };
    return this.saleNftsService.acceptNft(createSaleNftDto, user);
  }

  // @ApiBearerAuth()
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Post('ignore-make-offer')
  // async ignoreMakeOffer(@Query('id') id: number, @UserScope() user: User) {
  //   return this.saleNftsService.ignoreMakeOffer(Number(id), user);
  // }

  @Get('/bid-history')
  async getListBidHistory(@Query() dto: BidHistory) {
    return await this.saleNftsService.getListBidHistory(dto);
  }

  @Post('/trading-history')
  async getListTradingHistory(@Body() dto: TradingHistory) {
    return await this.saleNftsService.getListTradingHistory(dto);
  }

  @ApiQuery({ name: 'from_coin' })
  @ApiQuery({ name: 'to_coin' })
  @Get('exchange-rate-coin')
  async exchangeRateCoin(
    @Query('from_coin') fromCoin: string,
    @Query('to_coin') toCoin: string,
  ) {
    return this.saleNftsService.exchangeRateCoin(fromCoin, toCoin);
  }
}
