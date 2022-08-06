import { Module, CacheModule, HttpModule } from '@nestjs/common';
import { RateCoinService } from 'src/modules/rateCoins/rate-coin.service';
import * as redisStore from 'cache-manager-redis-store';
import { NetworkTokensModule } from 'src/modules/network-tokens/network-token.module';

@Module({
  imports: [
    HttpModule,
    CacheModule.register({
      // @ts-ignore
      store: redisStore,
      host:
        process.env.REDIS_HOST.replace('http://', '').replace('https://', '') ||
        'localhost',
      port: parseInt(process.env.REDIS_PORT, 10) || 6379,
      db: parseInt(process.env.REDIS_DB_CACHE, 10) || 0,
    }),
    NetworkTokensModule,
  ],
  providers: [RateCoinService],
  exports: [RateCoinService],
})
export class RateCoinModule {}
