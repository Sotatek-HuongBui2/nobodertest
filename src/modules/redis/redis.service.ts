import { Injectable } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class RedisService {
  private readonly client: RedisClientType
  constructor() {
    this.client = createClient({
        url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
      });
  }

  async connectRedis() {
    return await this.client.connect();
  }

  async disConnectRedis() {
    return await this.client.disconnect();
  }

  async getKeyCached(key: string) {
    return await this.client.get(key);
  }

  async setKeyCached(key: string, data: any, expired: number) {
    return await this.client.set(key, JSON.stringify(data), {
        EX: expired
    });
  }
}
