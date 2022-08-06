import { ApiTags } from '@nestjs/swagger';
import { ClassSerializerInterceptor, Controller, Get, UseInterceptors } from '@nestjs/common';
import { NetworkService } from 'src/modules/networks/network.service';
import { pagingInterceptor } from 'src/common/interceptors/paging-intercepter';

@ApiTags('networks')
@Controller('networks')
export class NetworkController {
  constructor(private readonly networkService: NetworkService) {}

  @Get()
  @UseInterceptors(pagingInterceptor)
  @UseInterceptors(ClassSerializerInterceptor)
  async findAll() {
    return this.networkService.findAll();
  }
}
