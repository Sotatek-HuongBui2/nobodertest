import { Module } from '@nestjs/common';
import { BlockchainsService } from './blockchains.service';

@Module({
  providers: [BlockchainsService],
  exports: [BlockchainsService],
})
export class BlockchainsModule {}
