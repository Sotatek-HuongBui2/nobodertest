import { Controller, Get, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { CollectionLaunchpadService } from "./collection-launchpad.service";
import { GetAllCollectionLaunchpadDto } from "./dto/get-all-collection-launchpad.dto";
import { GetLaunchpadDetailDto } from "./dto/get-launchpad-detail.dto";
import { GetNftsOfLaunchpadDto } from "./dto/get-nfts-of-launchpad.dto";


@ApiTags('launchpad')
@Controller('launchpad')
export class CollectionLaunchpadController {
  constructor(private readonly collectionLaunchpadService: CollectionLaunchpadService) {}

  @Get()
  async getAllCollectionLaunchPad(
    @Query() parameters: GetAllCollectionLaunchpadDto,
  ) {
    return await this.collectionLaunchpadService.getAllCollectionLaunchPad(parameters);
  }

  @Get('detail')
  async getCollectionLaunchpadDetail(
    @Query() parameters: GetLaunchpadDetailDto,
  ) {
    return await this.collectionLaunchpadService.getLaunchpadDetail(parameters.launchpadId);
  }

  @Get('nfts')
  async getNftsOfCollectionLaunchpad(
    @Query() parameters: GetNftsOfLaunchpadDto,
  ) {
    return await this.collectionLaunchpadService.getNftsOfLaunchpad(parameters);
  }
}
