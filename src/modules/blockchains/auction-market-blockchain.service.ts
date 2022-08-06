import 'dotenv/config';
import { Injectable } from '@nestjs/common';
import { Network } from '../networks/entities/network.entity';
import { NetworkToken } from '../network-tokens/entities/network-token.entity';
import { MarketBlockchainService } from './market-blockchain.service';
import XANALIA_DEX_ABI from './abi/xanalia_dex_abi.json';
import {
  convertPriceIntoWei,
  minusPrice,
} from 'src/common/utility/common.utility';
import { SaleNft } from '../sale-nft/entities/sale-nft.entity';
const timeExpired = 60 * 60 * 24 * 14; // 2 weeks

// eslint-disable-next-line @typescript-eslint/no-var-requires
const Web3 = require('web3');

@Injectable()
export class AuctionMarketBlockchainService {
  constructor(
    private readonly marketBlockchainService: MarketBlockchainService,
  ) {}

  async bidAuction(
    userAddress: string,
    tokenAddress: string,
    paymentToken: string,
    tokenId: string,
    auctionId: number,
    price: number,
    network: Network,
    networkToken: NetworkToken,
  ) {
    const contractAddress = this.marketBlockchainService.getContract(
      networkToken.tokenName,
      network,
    );
    const approveData = await this.marketBlockchainService.approve(
      contractAddress,
      userAddress,
      network.xanaliaDexContract,
      '',
      network,
      networkToken.tokenName,
      1,
    );
    const web3 = new Web3(network.rpc);
    const contractInstance = new web3.eth.Contract(
      XANALIA_DEX_ABI,
      network.xanaliaDexContract,
    );

    const data = contractInstance.methods
      .bidAuction(
        tokenAddress,
        paymentToken,
        tokenId,
        auctionId,
        convertPriceIntoWei(price, networkToken.decimal),
        parseInt((new Date().getTime() / 1000).toString()) + timeExpired,
      )
      .encodeABI();
    const details = await this.marketBlockchainService.createDetail(
      data,
      userAddress,
      network.xanaliaDexContract,
      network,
      networkToken,
      price,
    );
    if (process.env.TEST_LOCAL) {
      return this.marketBlockchainService.signTransaction(
        details,
        process.env.PRIVATEKEY2,
        network,
      );
    }
    return {
      signData: { ...details, networkId: network.id },
      approveData: approveData,
      isEditBid: false,
    };
  }

  async bidEditAuction(
    userAddress: string,
    bidPlaced: SaleNft,
    price: number,
    network: Network,
    networkToken: NetworkToken,
  ) {
    const approveData = null;
    const web3 = new Web3(network.rpc);
    const contractInstance = new web3.eth.Contract(
      XANALIA_DEX_ABI,
      network.xanaliaDexContract,
    );
    const realPrice = convertPriceIntoWei(price, networkToken.decimal);
    const data = contractInstance.methods
      .editBidAuction(
        bidPlaced.bidId,
        realPrice,
        parseInt((new Date().getTime() / 1000).toString()) + timeExpired,
      )
      .encodeABI();

    const holdPrice: number = minusPrice(price, bidPlaced.price);

    const details = await this.marketBlockchainService.createDetail(
      data,
      userAddress,
      network.xanaliaDexContract,
      network,
      networkToken,
      holdPrice,
    );
    if (process.env.TEST_LOCAL) {
      return this.marketBlockchainService.signTransaction(
        details,
        process.env.PRIVATEKEY2,
        network,
      );
    }
    return {
      signData: { ...details, networkId: network.id },
      approveData: approveData,
      isEditBid: true,
    };
  }

  async acceptBidAuction(
    userAddress: string,
    bidAuctionId: number,
    network: Network,
  ) {
    const web3 = new Web3(network.rpc);
    const contractInstance = new web3.eth.Contract(
      XANALIA_DEX_ABI,
      network.xanaliaDexContract,
    );
    const data = contractInstance.methods
      .acceptBidAuction(bidAuctionId)
      .encodeABI();
    const details = await this.marketBlockchainService.createDetail(
      data,
      userAddress,
      network.xanaliaDexContract,
      network,
    );
    if (process.env.TEST_LOCAL) {
      return this.marketBlockchainService.signTransaction(
        details,
        process.env.PRIVATEKEY,
        network,
      );
    }
    return {
      signData: { ...details, networkId: network.id },
    };
  }

  async reclaimAuction(
    userAddress: string,
    scAuctionId: number,
    network: Network,
  ) {
    const web3 = new Web3(network.rpc);
    const approveData = null;
    const contractInstance = new web3.eth.Contract(
      XANALIA_DEX_ABI,
      network.xanaliaDexContract,
    );
    const data = contractInstance.methods
      .reclaimAuction(scAuctionId)
      .encodeABI();
    const details = await this.marketBlockchainService.createDetail(
      data,
      userAddress,
      network.xanaliaDexContract,
      network,
    );
    if (process.env.TEST_LOCAL) {
      return this.marketBlockchainService.signTransaction(
        details,
        process.env.PRIVATEKEY,
        network,
      );
    }
    return {
      approveData: approveData,
      signData: { ...details, networkId: network.id },
    };
  }

  async cancelBidAuction(userAddress, bidAuctionId, network: Network) {
    const approveData = null;
    const web3 = new Web3(network.rpc);
    const contractInstance = new web3.eth.Contract(
      XANALIA_DEX_ABI,
      network.xanaliaDexContract,
    );
    const data = contractInstance.methods
      .cancelBidAuction(bidAuctionId)
      .encodeABI();

    const details = await this.marketBlockchainService.createDetail(
      data,
      userAddress,
      network.xanaliaDexContract,
      network,
    );
    if (process.env.TEST_LOCAL) {
      return this.marketBlockchainService.signTransaction(
        details,
        process.env.PRIVATEKEY2,
        network,
      );
    }
    return {
      approveData: approveData,
      signData: { ...details, networkId: network.id },
    };
  }
}
