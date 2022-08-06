import { Factory, Seeder } from 'typeorm-seeding';
import { Connection } from 'typeorm';

import { Network } from 'src/modules/networks/entities/network.entity';
import { NetworkStatus } from 'src/modules/networks/enums';
import { NetworkTokenStatus } from 'src/modules/network-tokens/enums';
import { NetworkToken } from 'src/modules/network-tokens/entities/network-token.entity';

export default class NetworkSeed implements Seeder {
  public async run(factory: Factory, connection: Connection): Promise<any> {
    await connection
      .createQueryBuilder()
      .insert()
      .into(Network)
      .values([
        {
          id: 1,
          name: 'Ethereum',
          chainId: 1, // Ethereum
          marketContract: '0xe7c8996F4D46970F09E1762abF9F72b152110003',
          auctionContract: '0xE5B35F797877c7F41a0f36f89f302d720cfcd730',
          xanalia1155GeneralContract: '',
          xanalia721GeneralContract: '0x110787be11117c8d46e72b817ef6f57157336c5c',
          xanaliaDexContract: '0xF27747aDcfd27E873dCdB4bF82833A0f6d493A12',
          offerDexContract: '0x6B0B7b5999d0566F0454E81F9AE73ba9B6360323',
          xanaliaURIContract: '0x70537BeFbc30Ab35DE746e36A1e2db309CcD1F2e',
          xanaliaTreasury: '0xacA27500ee5F2949E370A77e416A2f7831f2ceaF',
          rpc: 'https://mainnet.infura.io/v3/0851538c9c2448ad851b814b9878d777',
          gasLimit: 500000,
          gasLimitCollection: 3000000,
          gasPrice: '20e9',
          status: NetworkStatus.ACTIVE,
          image: 'https://storage.xanalia.com/icon/eth_icon.svg',
          moralisTransactions: 'EthTransactions',
        },
        {
          id: 2,
          name: 'Polygon',
          chainId: 137, // Polygon
          marketContract: '0xe7c8996F4D46970F09E1762abF9F72b152110003',
          auctionContract: '0xE5B35F797877c7F41a0f36f89f302d720cfcd730',
          xanalia1155GeneralContract: '',
          xanalia721GeneralContract: '0x110787be11117c8d46e72b817ef6f57157336c5c',
          xanaliaDexContract: '0xF27747aDcfd27E873dCdB4bF82833A0f6d493A12',
          offerDexContract: '0x6B0B7b5999d0566F0454E81F9AE73ba9B6360323',
          xanaliaURIContract: '0x70537BeFbc30Ab35DE746e36A1e2db309CcD1F2e',
          xanaliaTreasury: '0xacA27500ee5F2949E370A77e416A2f7831f2ceaF',
          rpc: 'https://polygon-rpc.com/',
          gasLimit: 500000,
          gasLimitCollection: 3000000,
          gasPrice: '20e9',
          status: NetworkStatus.ACTIVE,
          image: 'https://storage.xanalia.com/icon/polygon_icon.svg',
          moralisTransactions: 'PolygonTransactions',
        },
        {
          id: 3,
          name: 'BSC',
          chainId: 56, // Binance
          marketContract: '0xe7c8996F4D46970F09E1762abF9F72b152110003',
          auctionContract: '0xE5B35F797877c7F41a0f36f89f302d720cfcd730',
          xanalia1155GeneralContract: '',
          xanalia721GeneralContract: '0x110787be11117c8d46e72b817ef6f57157336c5c',
          xanaliaDexContract: '0xF27747aDcfd27E873dCdB4bF82833A0f6d493A12',
          offerDexContract: '0x6B0B7b5999d0566F0454E81F9AE73ba9B6360323',
          xanaliaURIContract: '0x70537BeFbc30Ab35DE746e36A1e2db309CcD1F2e',
          xanaliaTreasury: '0xacA27500ee5F2949E370A77e416A2f7831f2ceaF',
          rpc: 'https://bsc-dataseed.binance.org/',
          gasLimit: 500000,
          gasLimitCollection: 3000000,
          gasPrice: '20e9',
          status: NetworkStatus.ACTIVE,
          image: 'https://storage.xanalia.com/icon/bsc_icon.svg',
          moralisTransactions: 'BscTransactions',
        },
      ])
      .execute();

    await Promise.all([
      connection
        .createQueryBuilder()
        .insert()
        .into(NetworkToken)
        .values([
          {
            networkId: 1,
            tokenName: 'ETH',
            decimal: 18,
            isNativeToken: 1,
            status: NetworkTokenStatus.ACTIVE,
            contractAddress: '0x0000000000000000000000000000000000000000',
            currency: 'ETH',
            icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png',
          },
          {
            networkId: 1,
            tokenName: 'USDT',
            decimal: 18,
            isNativeToken: 0,
            status: NetworkTokenStatus.ACTIVE,
            contractAddress: '0xdac17f958d2ee523a2206206994597c13d831ec7',
            currency: 'USDT',
            icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/825.png',
          },
          {
            networkId: 2,
            tokenName: 'MATIC',
            decimal: 18,
            isNativeToken: 1,
            status: NetworkTokenStatus.ACTIVE,
            contractAddress: '0x0000000000000000000000000000000000000000',
            currency: 'MATIC',
            icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3890.png',
          },
          {
            networkId: 2,
            tokenName: 'USDC',
            decimal: 18,
            isNativeToken: 0,
            status: NetworkTokenStatus.ACTIVE,
            contractAddress: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
            currency: 'USDC',
            icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png',
          },
          {
            networkId: 2,
            tokenName: 'ALIA',
            decimal: 18,
            isNativeToken: 0,
            status: NetworkTokenStatus.ACTIVE,
            contractAddress: '0xe1a4af407A124777A4dB6bB461b6F256c1f8E341',
            currency: 'ALIA',
            icon: 'https://nomics.com/imgpr/https%3A%2F%2Fs3.us-east-2.amazonaws.com%2Fnomics-api%2Fstatic%2Fimages%2Fcurrencies%2FALIA.png?width=48',
          },
          {
            networkId: 2,
            tokenName: 'WETH',
            decimal: 18,
            isNativeToken: 0,
            status: NetworkTokenStatus.ACTIVE,
            contractAddress: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
            currency: 'WETH',
            icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/2396.png',
          },
          {
            networkId: 3,
            tokenName: 'BNB',
            decimal: 18,
            isNativeToken: 1,
            status: NetworkTokenStatus.ACTIVE,
            contractAddress: '0x0000000000000000000000000000000000000000',
            currency: 'BNB',
            icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1839.png',
          },
          {
            networkId: 3,
            tokenName: 'ALIA',
            decimal: 18,
            isNativeToken: 0,
            status: NetworkTokenStatus.ACTIVE,
            contractAddress: '0x13861c017735d3b2f0678a546948d67ad51ac07b',
            currency: 'ALIA',
            icon: 'https://nomics.com/imgpr/https%3A%2F%2Fs3.us-east-2.amazonaws.com%2Fnomics-api%2Fstatic%2Fimages%2Fcurrencies%2FALIA.png?width=48',
          },
          {
            networkId: 3,
            tokenName: 'BUSD',
            decimal: 18,
            isNativeToken: 0,
            status: NetworkTokenStatus.ACTIVE,
            contractAddress: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56',
            currency: 'BUSD',
            icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/4687.png',
          },
        ])
        .execute(),
    ]);
  }
}
