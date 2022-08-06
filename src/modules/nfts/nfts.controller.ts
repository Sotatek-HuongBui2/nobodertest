import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  NotFoundException, Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { NftsService } from './nfts.service';
import { UserService } from '../users/user.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserScope } from 'src/common/decorators/user.decorator';
import { User } from '../users/entities/user.entity';
import { ValidateNftInterceptor } from 'src/common/interceptors/validate-nfts.interceptor';
import { CreateNftDto } from './dto/create-nft.dto';
import { CustomErrorMessage } from 'src/common/constants/error-message';
import { CollectionStatus } from '../collections/enums';
import { UpdateNftDto } from './dto/update-nft.dto';
import { GetNftDetailDto } from './dto/get-nft-detail.dto';
import { GetListNftsDto } from './dto/get-list-nfts.dto';
import { GetListNftsMarketDto } from './dto/get-list-nfts-market.dto';
import { GetListNftsByCollectionDto } from './dto/get-list-nfts-by-collection.dto';
import { GetListNftsRankingDto } from './dto/get-list-nfts-ranking.dto';
import { UserLikeNftDto } from '../users/dto/user-like-nft.dto';
import { GetListNftsSliderDto } from './dto/get-list-nft-slider-dto';
import { GetListNftsDiscoverDto } from './dto/get-list-nft-discover-dto';
import { GetAllNftsMarketDto } from './dto/get-all-nfts-market.dto';
import { GetNftByUserAddressDto } from './dto/get-nfts-by-user-address.dto';

@ApiTags('nfts')
@Controller('nfts')
export class NftsController {
  constructor(
    private readonly nftsService: NftsService,
    private readonly userService: UserService,
  ) { }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  @UseInterceptors(ValidateNftInterceptor)
  @UseInterceptors(ClassSerializerInterceptor)
  async create(@UserScope() user: User, @Body() createNft: CreateNftDto) {
    return this.nftsService.create(user, createNft);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Put('image-path')
  async imagePathHook(
    @UserScope() user: User,
    @Query('id', ParseIntPipe) id: number,
    @Body() updateNftDto: UpdateNftDto,
  ) {
    await this.nftsService.update(id, updateNftDto);
    const nfts = await this.nftsService.findById(id);

    if (!nfts.collections) {
      throw new NotFoundException(
        CustomErrorMessage['NFT.NFT_COLLECTIONS_NOT_FOUND'],
      );
    }

    if (nfts.collections.status == CollectionStatus.DONE) {
      return this.nftsService.createNfts(nfts, user);
    }

    throw new NotFoundException(
      CustomErrorMessage['NFT.NFT_COLLECTIONS_STATUS_FALSE'],
    );
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Put(':id')
  async update(
      @UserScope() user: User,
      @Param('id', ParseIntPipe) id: number,
      @Body() updateNftDto: UpdateNftDto,
  ) {
    return this.nftsService.update(id, updateNftDto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('nfts-by-id')
  async nftsById(@Query('nftsId', ParseIntPipe) nftId: number) {
    return this.nftsService.nftsById(nftId);
  }

  @Get('details')
  async nftDetails(@Query() getNftDetailDto: GetNftDetailDto) {
    return this.nftsService.nftDetails(getNftDetailDto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get()
  async getListNft(
    @UserScope() user: User,
    @Query() getListNftsDto: GetListNftsDto,
  ) {
    let { collection, network, ownerNft, pageIndex, pageSize } =
      getListNftsDto;
    return this.nftsService.getListNfts(
      user,
      // isDraft,
      collection,
      network,
      ownerNft,
      pageIndex,
      pageSize,
    );
  }

  // @ApiBearerAuth()
  // @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('nfts-markets')
  async getistNftMarket(@Query() getListNftsMarketDto: GetListNftsMarketDto) {
    const { category, pageIndex, pageSize } = getListNftsMarketDto;

    return this.nftsService.getListNftsMarket(category, pageIndex, pageSize);
  }

  @Get('all-nfts-markets')
  async getAllNftMarket(@Query() getAllNftsMarketDto: GetAllNftsMarketDto) {
    const { pageIndex, pageSize, sortFilter, categoryFilter, userId } = getAllNftsMarketDto;
    return this.nftsService.getAllNftMarket(pageIndex, pageSize, sortFilter, categoryFilter, userId);
  }


  @Get('nfts-by-collection')
  async getistNftsByCollection(@Query() getListNftByCollection: GetListNftsByCollectionDto) {
    const { collectionAddress, collectionId, page, limit, isRandom, currentNftId, userId, networkId } = getListNftByCollection;

    return this.nftsService.getListNftsByCollection(page, limit, collectionId, collectionAddress, isRandom, currentNftId, userId, networkId);
  }

  @Get('nfts-ranking')
  async getistNftsRanking(@Query() getNftsRanking: GetListNftsRankingDto) {

    return this.nftsService.getListNftsRanking(getNftsRanking);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('like')
  async processUserLikeNft(@UserScope() user: User, @Body() userLikeNftDto: UserLikeNftDto) {
    return this.nftsService.processUserLikeNft(userLikeNftDto, user)
  }

  @Get('nfts-slider')
  async getListNftSlider(@Query() getNftsSlider: GetListNftsSliderDto) {
    return this.nftsService.getListNftsSlider(getNftsSlider);
  }

  @Get('nfts-discover')
  async getListNftsDiscover(@Query() getNftsDiscover: GetListNftsDiscoverDto) {
    return this.nftsService.getListNftsDisCover(getNftsDiscover);
  }

  @Get('nft-by-address-user')
  async getNftByUserAddress(@Query() getNftByUserAddressDto: GetNftByUserAddressDto) {
    return this.nftsService.getNftByUserAddress(getNftByUserAddressDto);
  }
}
