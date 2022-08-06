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
import { CollectionsService } from './collections.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserScope } from 'src/common/decorators/user.decorator';
import { User } from '../users/entities/user.entity';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { GetListCollectionDto } from './dto/get-list-collection.dto';
import { GetInfoCollectionDto } from './dto/get-info-collection';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UpdateCollectionDto } from './dto/update-collection.dto';
import { GetListCollectionsDto } from './dto/get-list-collections.dto';
import { GetHotCollectionsDto } from './dto/get-hot-collections.dto';
import { DetailCollectionDto } from './dto/detail-collection.dto';
import { NftInCollectionDto, NftOwnerCollectionDto } from './dto/nft-in-collection.dto';
import { GetRankingCollectionsDto } from './dto/get-ranking-collections.dto';
import { GetSelfCollectionDto } from './dto/get-self-collection.dto';

@ApiTags('collections')
@Controller('collections')
export class CollectionsController {
  constructor(private readonly collectionsService: CollectionsService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @UserScope() user: User,
    @Body() createCollectionDto: CreateCollectionDto,
  ) {
    return this.collectionsService.create(createCollectionDto, user);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateCollectionDto: UpdateCollectionDto,
    @UserScope() user: User,
  ) {
    return this.collectionsService.update(+id, updateCollectionDto, user);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('actual-collections')
  getAllCollection(
    @UserScope() user: User,
    @Query() getListCollection: GetListCollectionDto,
  ) {
    return this.collectionsService.getAllCollection(getListCollection, user.id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('self')
  getMyCollection(
    @UserScope() user: User,
    @Query() parameters: GetSelfCollectionDto,
  ) {
    return this.collectionsService.getMyCollection(parameters.networkId, user.id);
  }

  @Get('hot-collections')
  getHotCollection(@Query() getHotCollections: GetHotCollectionsDto) {
    return this.collectionsService.getHotCollection(getHotCollections);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('collection-info')
  getInfoCollection(
    @UserScope() user: User,
    @Query() getInfoCollection: GetInfoCollectionDto,
  ) {
    return this.collectionsService.getInfoCollection(getInfoCollection);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('get-collection-with-nft')
  getCollectionWithNft(@UserScope() user: User) {
    return this.collectionsService.getCollectionWithNft(user);
  }

  @Get('list-collections')
  getListCollections(@Query() getListCollectionsDto: GetListCollectionsDto) {
    const { networkId, pageIndex, pageSize, name } = getListCollectionsDto;
    return this.collectionsService.getListCollections(
      pageIndex,
      pageSize,
      networkId,
      name,
    );
  }

  @Post('ranking-collections')
  getRankingCollection(@Body() dto: GetRankingCollectionsDto) {
    return this.collectionsService.getRankingCollection(dto);
  }

  @Get()
  async getCollectionAllUser(
    @Query() listCollectionAllUser: GetHotCollectionsDto,
  ) {
    return await this.collectionsService.getCollectionAllUser(
      listCollectionAllUser,
    );
  }

  @Get('hot')
  async getHotCollections(
    @Query() listCollectionAllUser: GetHotCollectionsDto,
  ) {
    return await this.collectionsService.getCollectionAllUser(listCollectionAllUser, 1);
  }

  @Get('/collectionId')
  async getCollectionById(@Query() detailCollectionDto: DetailCollectionDto) {
    // return await this.collectionsService.getCollectionById(detailCollectionDto);
    return await this.collectionsService.getDetailOfCollection(detailCollectionDto);
  }

  @Get('/nft/collectionId')
  async getNftsByCollectionIds(
    @Query() nftInCollectionDto: NftInCollectionDto,
  ) {
    return await this.collectionsService.getNftsByCollectionId(nftInCollectionDto)
  }

  @Get('/nft/owner/collectionId')
  async getNftOfOwner(
    @Query() nftOwnerInCollectionDto: NftOwnerCollectionDto,
  ) {
    return await this.collectionsService.getNftsOwnerByCollectionId(nftOwnerInCollectionDto)
  }
}
