import {
  Injectable,
  Inject,
  CACHE_MANAGER,
  InternalServerErrorException,
  HttpService,
} from '@nestjs/common';
import { Cache } from 'cache-manager';
import { CustomErrorMessage } from 'src/common/constants/error-message';
import { Promise } from 'bluebird';
import BigNumber from 'bignumber.js';
import { IExchangeRateCoin } from 'src/modules/rateCoins/rate-coin.interface';
import { NetworkTokensService } from 'src/modules/network-tokens/network-tokens.service';
import { uniq, uniqBy } from 'lodash';

@Injectable()
export class RateCoinService {
  constructor(
    private readonly httpService: HttpService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly networkTokenService: NetworkTokensService,
  ) {}

  getCoinName(coin) {
    if (coin.includes('ETH')) {
      coin = 'ETH';
    } else if (coin.includes('USDT')) {
      coin = 'USDT';
    } else if (coin.includes('BNB')) {
      coin = 'BNB';
    }
    return coin;
  }

  async exchangeRateCoin(
    fromCoin: string,
    toCoin: string,
  ): Promise<IExchangeRateCoin> {
    const timeExchange = Number(
      process.env.TIME_REFRESH_EXCHANGE_RATE || 300000,
    );

    let data: any = await this.cacheManager.get(
      `${fromCoin.toLowerCase()}To${toCoin.toLowerCase()}`,
    );
    if (data) {
      if (Number(data.timeExchange) + timeExchange < Date.now()) {
        try {
          const totalPrice = await this.getExchangePrice(fromCoin, toCoin);
          if (totalPrice) {
            data.exchangeRate = totalPrice.toNumber();
            const key = `${fromCoin.toLowerCase()}To${toCoin.toLowerCase()}`;
            await this.cacheManager.set(
              key,
              {
                fromCoin: fromCoin,
                toCoin: toCoin,
                exchangeRate: data.exchangeRate,
                timeExchange: Date.now(),
              },
              { ttl: 86400 },
            );
          }
        } catch (err) {
          console.log("🚀 ~ file: rate-coin.service.ts ~ line 65 ~ RateCoinService ~ err", err)
        }
        return {
          from_coin: data.fromCoin,
          to_coin: data.toCoin,
          exchange_rate: data.exchangeRate,
        };
      } else {
        return {
          from_coin: data.fromCoin,
          to_coin: data.toCoin,
          exchange_rate: data.exchangeRate,
        };
      }
    } else {
      const totalPrice = await this.getExchangePrice(fromCoin, toCoin);

      if (totalPrice) {
        data = {
          fromCoin: fromCoin,
          toCoin: toCoin,
          exchangeRate: totalPrice.toNumber(),
          timeExchange: Date.now(),
        };
        const key = `${fromCoin.toLowerCase()}To${toCoin.toLowerCase()}`;
        await this.cacheManager.set(key, data, { ttl: 86400 });

        return {
          from_coin: data.fromCoin,
          to_coin: data.toCoin,
          exchange_rate: data.exchangeRate,
        };
      } else {
        throw new InternalServerErrorException(
          CustomErrorMessage['SALE_NFT.CAN_NOT_GET_EXCHANGE_RATE'],
        );
      }
    }
  }

  async saveExchangeRateCoinToCache(fromCoin: string, toCoin: string) {
    let data = {
      fromCoin: fromCoin,
      toCoin: toCoin,
      exchangeRate: 1,
      timeExchange: Date.now(),
    };

    if (fromCoin !== toCoin) {
      const totalPrice = await this.getExchangePrice(fromCoin, toCoin);
      if (totalPrice) {
        data = {
          ...data,
          exchangeRate: totalPrice.toNumber(),
          timeExchange: Date.now(),
        };
      }
    }

    const key = `${fromCoin.toLowerCase()}To${toCoin.toLowerCase()}`;
    await this.cacheManager.set(key, data, { ttl: 86400 });
  }

  async exchangeRateCoinMultipleToken(fromCoin: string, toCoin: string[]) {
    const dataArr = [];
    for await (const item of toCoin) {
      const itemData: any = await this.cacheManager.get(
        `${fromCoin.toLowerCase()}To${item.toLowerCase()}`,
      );
      dataArr.push(itemData);
    }

    const dataReturn = [];
    const exchangeData = dataArr.filter(function (el) {
      return el != null;
    });
    if (exchangeData.length > 0) {
      for await (const data of exchangeData) {
        dataReturn.push({
          from_coin: data.fromCoin,
          to_coin: data.toCoin,
          exchange_rate: data.exchangeRate,
        });
      }
    } else {
      throw new InternalServerErrorException(
        CustomErrorMessage['SALE_NFT.CAN_NOT_GET_EXCHANGE_RATE'],
      );
    }

    return dataReturn;
  }

  async getExchangePrice(fromCoin: string, toCoin: string): Promise<BigNumber> {
    const fromCoinUpperCase = this.getCoinName(fromCoin).toUpperCase();
    const toCoinUpperCase = this.getCoinName(toCoin).toUpperCase();
    const [exchangeDataNomics, exchangeDataMarketCap] = await Promise.all([
      this.httpService
        .get(process.env.EXCHANGE_RATE_URL_NOMICS, {
          params: {
            'quote-currency': toCoinUpperCase,
            symbols: fromCoinUpperCase,
          },
        })
        .toPromise()
        .catch(function (err) {
          console.log(
            'Error: getExchangePrice:',
            `${process.env.EXCHANGE_RATE_URL_NOMICS}`,
          );
        }),
      this.httpService
        .get(process.env.EXCHANGE_RATE_URL_MARKET_CAP, {
          headers: {
            'X-CMC_PRO_API_KEY': process.env.MARKET_CAP_KEY,
            Accept: 'application/json',
          },
          params: {
            amount: 1,
            symbol: fromCoinUpperCase,
            convert: toCoinUpperCase,
          },
        })
        .toPromise()
        .catch(function (err) {
          console.log(
            'Error: getExchangePrice: ',
            `${process.env.EXCHANGE_RATE_URL_MARKET_CAP}`,
          );
        }),
    ]);

    let priceNomics;
    let priceMarketCap;
    let totalPrice;
    if (
      exchangeDataNomics &&
      exchangeDataNomics.data &&
      exchangeDataNomics.data.items &&
      exchangeDataNomics.data.items.length > 0
    ) {
      priceNomics = exchangeDataNomics.data.items[0].price;
    }
    if (
      exchangeDataMarketCap &&
      exchangeDataMarketCap.data &&
      exchangeDataMarketCap.data.data &&
      exchangeDataMarketCap.data.data.quote &&
      exchangeDataMarketCap.data.data.quote &&
      exchangeDataMarketCap.data.data.quote[toCoinUpperCase]
    ) {
      priceMarketCap =
        exchangeDataMarketCap.data.data.quote[toCoinUpperCase].price;
    }

    if (priceNomics && priceMarketCap) {
      const bigNumberPriceNomics = new BigNumber(priceNomics);
      const bigNumberPriceMarketCap = new BigNumber(priceMarketCap);
      totalPrice = bigNumberPriceNomics
        .plus(bigNumberPriceMarketCap)
        .dividedBy(2);
    } else if (priceNomics && !priceMarketCap) {
      totalPrice = new BigNumber(priceNomics);
    } else if (!priceNomics && priceMarketCap) {
      totalPrice = new BigNumber(priceMarketCap);
    }

    return totalPrice;
  }

  async getExchangeRateByNetworkTokens(
    toCoin = 'ETH',
  ): Promise<IExchangeRateCoin[]> {
    const promises: Promise<IExchangeRateCoin>[] = [];
    const allNetworkToken = await this.networkTokenService.getAll();
    const fromCoinExchange = uniq([
      ...allNetworkToken.map((networkToken) => networkToken.currency),
    ]);

    fromCoinExchange.forEach((fromCoin) => {
      if (fromCoin !== toCoin) {
        promises.push(this.exchangeRateCoin(fromCoin, toCoin));
      }
    });

    const exchangeRatesCoin = await Promise.all(promises);
    const exchangeRates = [];

    exchangeRatesCoin.forEach((exchangeRateCoin) => {
      const networkTokens = allNetworkToken.filter(
        (networkToken) => networkToken.currency === exchangeRateCoin.from_coin,
      );
      if (networkTokens.length) {
        networkTokens.forEach((networkToken) => {
          exchangeRates.push({
            ...exchangeRateCoin,
            from_coin: networkToken.tokenName,
          });
        });
      }
    });

    return uniqBy(exchangeRates, 'from_coin');
  }
}
