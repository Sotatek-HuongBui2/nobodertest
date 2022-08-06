import 'dotenv/config';
import { Injectable } from '@nestjs/common';
import { convertPriceIntoWei } from 'src/common/utility/common.utility';
import { Network } from '../networks/entities/network.entity';
import XANALIA_DEX_ABI from './abi/xanalia_dex_abi.json';
import { MarketBlockchainService } from '../blockchains/market-blockchain.service';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const Web3 = require('web3');

@Injectable()
export class AuctionBlockchainService {
  constructor(
    private readonly marketBlockchainService: MarketBlockchainService,
  ) {}

  async createAuction(
    userAddress: string,
    contractAddress: string,
    paymentToken: string,
    tokenId: string,
    startPrice: number,
    startTime,
    endTime,
    network: Network,
    networkToken,
  ) {
    const web3 = new Web3(network.rpc);
    const contractInstance = new web3.eth.Contract(
      XANALIA_DEX_ABI,
      network.xanaliaDexContract,
    );
    const data = contractInstance.methods
      .createAuction(
        contractAddress,
        paymentToken,
        tokenId,
        convertPriceIntoWei(startPrice, networkToken.decimal),
        startTime,
        endTime,
      )
      .encodeABI();
    const detail = await this.marketBlockchainService.createDetail(
      data,
      userAddress,
      network.xanaliaDexContract,
      network,
    );
    if (process.env.TEST_LOCAL) {
      return this.marketBlockchainService.signTransaction(
        detail,
        process.env.PRIVATEKEY,
        network,
      );
    }
    return {
      signData: { ...detail, networkId: network.id },
    };
  }

  async cancelAuction(
    auctionId: number,
    userAddress: string,
    network: Network,
  ) {
    const approveData = null;
    const web3 = new Web3(network.rpc);
    const contractInstance = new web3.eth.Contract(
      XANALIA_DEX_ABI,
      network.xanaliaDexContract,
    );
    const data = contractInstance.methods.cancelAuction(auctionId).encodeABI();

    const detail = await this.marketBlockchainService.createDetail(
      data,
      userAddress,
      network.xanaliaDexContract,
      network,
    );
    if (process.env.TEST_LOCAL) {
      return this.marketBlockchainService.signTransaction(
        detail,
        process.env.PRIVATEKEY,
        network,
      );
    }
    return {
      approveData: approveData,
      signData: { ...detail, networkId: network.id },
    };
  }
}
