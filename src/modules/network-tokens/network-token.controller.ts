import { ApiTags } from '@nestjs/swagger';
import { Controller } from '@nestjs/common';
import { NetworkTokensService } from 'src/modules/network-tokens/network-tokens.service';

@ApiTags('network-tokens')
@Controller('network-tokens')
export class NetworkTokensController {
  constructor(private readonly networkTokensService: NetworkTokensService) {}
}
