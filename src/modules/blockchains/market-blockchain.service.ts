import 'dotenv/config';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Network } from 'src/modules/networks/entities/network.entity';
import { collectionType } from '../collections/enums';
import { CustomErrorMessage } from 'src/common/constants/error-message';
import { Collection } from '../collections/entities/collections.entity';
import { getGasLimit, getGasPrice } from 'src/common/utility/gas.utility';
import {
  convertPriceIntoWei,
  convertWeiIntoPrice,
  multiplied,
} from 'src/common/utility/common.utility';
import { SaleNft } from '../sale-nft/entities/sale-nft.entity';
import { SaleNftStatus } from '../sale-nft/const';
import { SaleNftRepository } from '../sale-nft/sale-nft.repository';
import COLLECTION_ABI from './abi/collection_abi.json';
import ERC20_ABI from './abi/erc20_abi.json';
import { NetworkToken } from '../network-tokens/entities/network-token.entity';
const maxUInt =
  '115792089237316195423570985008687907853269984665640564039457584007913129639935';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const Web3 = require('web3');
import XANALIA_DEX_ABI from './abi/xanalia_dex_abi.json';
@Injectable()
export class MarketBlockchainService {
  constructor(private readonly saleNftRepository: SaleNftRepository) {}

  async buy(
    itemId: number,
    quantity: number,
    receiveToken: string,
    paymentAmount: number,
    address: string,
    privateKey: string,
    walletType: number,
    network: Network,
    royalty = 0,
  ) {
    const contractAddress = this.getContract(receiveToken, network);
    const networkToken = this.getNetworkToken(network, receiveToken);

    const approveData = await this.approve(
      contractAddress,
      address,
      network.xanaliaDexContract,
      privateKey,
      network,
      receiveToken,
      walletType,
    );
    const web3 = new Web3(network.rpc);
    const contractInstance = new web3.eth.Contract(
      XANALIA_DEX_ABI,
      network.xanaliaDexContract,
    );
    const data = contractInstance.methods
      .buy(itemId, contractAddress)
      .encodeABI();
    const detail = await this.createDetail(
      data,
      address,
      network.xanaliaDexContract,
      network,
      networkToken,
      paymentAmount,
      walletType,
      royalty,
      0,
    );
    if (walletType > 0 && !process.env.TEST_LOCAL)
      return {
        approveData: approveData,
        signData: { ...detail, networkId: network.id },
      };
    return this.signTransaction(detail, process.env.PRIVATEKEY2, network);
  }

  getContract(token: string, network: Network, isAddress0 = false) {
    if (isAddress0) {
      return '0x0000000000000000000000000000000000000000';
    }

    const networkToken = this.getNetworkToken(network, token);
    return networkToken.isNativeToken
      ? '0x0000000000000000000000000000000000000000'
      : networkToken.contractAddress;
  }

  getNetworkToken(network: Network, token: string) {
    const networkToken = network.networkTokens.find(
      (networkToken) => networkToken.tokenName === token,
    );
    if (!networkToken) {
      throw new BadRequestException(
        CustomErrorMessage['NETWORK_TOKEN.NOT_FOUND'],
      );
    }

    return networkToken;
  }

  async signTransaction(detail, privateKey: string, network: Network) {
    const web3 = new Web3(network.rpc);
    const signedTransaction = await web3.eth.accounts.signTransaction(
      detail,
      privateKey,
    );
    return this.sendSignedTransaction(
      signedTransaction.rawTransaction,
      network,
    );
  }

  async sendSignedTransaction(rawTransaction: string, network: Network) {
    console.log(`MarketService::sendSignedTransaction rawTx=${rawTransaction}`);
    try {
      const web3 = new Web3(network.rpc);
      const tx = await web3.eth.sendSignedTransaction(rawTransaction);
      console.log(tx);
      return tx;
    } catch (e) {
      console.error(
        `MarketService::sendSignedTransaction rawTx=${rawTransaction} error=${e.toString()}`,
        e,
      );
      if (e.receipt) return e.receipt;
      throw e;
    }
  }

  async getBalance(address: string, token: string, network: Network) {
    let result = 0;
    const web3 = new Web3(network.rpc);
    const networkToken = this.getNetworkToken(network, token);

    if (networkToken?.isNativeToken) {
      result = Number(web3.utils.fromWei(await web3.eth.getBalance(address)));
    } else {
      const contractInstance = new web3.eth.Contract(
        ERC20_ABI,
        networkToken.contractAddress,
      );
      const balance = await contractInstance.methods.balanceOf(address).call();
      result = convertWeiIntoPrice(balance, networkToken.decimal);
    }

    return result;
  }

  async approve(
    contractAddress: string,
    address: string,
    approvedAddress: string,
    privateKey: string,
    network: Network,
    receiveToken: string,
    walletType = 0,
  ) {
    let abi;
    // Change after have list token of chain
    const networkToken = this.getNetworkToken(network, receiveToken);
    if (
      contractAddress === '0x0000000000000000000000000000000000000000' ||
      networkToken?.isNativeToken
    ) {
      return;
    } else {
      abi = ERC20_ABI;
    }

    const web3 = new Web3(network.rpc);
    const contractInstance = new web3.eth.Contract(abi, contractAddress);
    const allowance = await contractInstance.methods
      .allowance(address, approvedAddress)
      .call();
    console.log('allowance:', allowance);
    if (allowance > 0) return;
    const nonce = await web3.eth.getTransactionCount(address);
    const data = contractInstance.methods
      .approve(approvedAddress, maxUInt)
      .encodeABI();
    const details: any = {
      from: address,
      to: contractAddress,
      value: 0,
      data: data,
      nonce: nonce,
      gas: await getGasLimit(),
      gasPrice: await getGasPrice(web3),
    };
    if (walletType > 0 && !process.env.TEST_LOCAL) {
      return details;
    }

    return this.signTransaction(details, process.env.PRIVATEKEY2, network);
  }

  async updateFailSaleNft(saleNft: SaleNft, txId: string = null) {
    await this.saleNftRepository.update(
      { id: saleNft.id },
      { status: SaleNftStatus.FAIL, txId: txId },
    );
  }

  async createDetail(
    data: string,
    address: string,
    contractAddress: string,
    network: Network,
    networkToken?: NetworkToken,
    amount = 0,
    walletType?: number,
    royalty = 0,
    platformCommission = 0.025,
  ) {
    const web3 = new Web3(network.rpc);
    const nonce = await web3.eth.getTransactionCount(address, 'pending');
    const totalPrice = amount * (1 + platformCommission + royalty / 100);

    const detail = {
      from: address,
      to: contractAddress,
      value:
        networkToken &&
        networkToken.contractAddress ===
          '0x0000000000000000000000000000000000000000'
          ? Number(
              convertPriceIntoWei(totalPrice, networkToken.decimal),
            ).toFixed(0)
          : 0,
      data,
      nonce,
      gas: await getGasLimit(),
      gasPrice: await getGasPrice(web3),
    };
    return detail;
  }

  async isApprovedForAll(
    address: string,
    collection: Collection,
    network: Network,
    addressApprove: string = network.xanaliaDexContract,
  ) {
    let contractInstance;
    const web3 = new Web3(network.rpc);
    if (
      collection.type == collectionType.xanalia721 ||
      collection.type == collectionType.xanalia721Artist ||
      collection.type == collectionType.default
    ) {
      console.log('----- is ApprovedForAll xanalia721 -----');
      contractInstance = new web3.eth.Contract(
        COLLECTION_ABI,
        collection.contractAddress,
      );
    } else {
      throw new NotFoundException(CustomErrorMessage['NFT.NOT_SUPPORT']);
    }
    return contractInstance.methods
      .isApprovedForAll(address, addressApprove)
      .call();
  }

  async setApprovalForAll(
    address: string,
    collection: Collection,
    network: Network,
    walletType = 0,
    addressApprove: string = network.xanaliaDexContract,
  ) {
    let contractInstance;
    const web3 = new Web3(network.rpc);

    if (
      collection.type == collectionType.xanalia721 ||
      collection.type == collectionType.xanalia721Artist ||
      collection.type == collectionType.default
    ) {
      console.log('----- is ApprovedForAll xanalia721 -----');
      contractInstance = new web3.eth.Contract(
        COLLECTION_ABI,
        collection.contractAddress,
      );
    } else {
      throw new NotFoundException(CustomErrorMessage['NFT.NOT_SUPPORT']);
    }

    const nonce = await web3.eth.getTransactionCount(address);
    const data = contractInstance.methods
      .setApprovalForAll(addressApprove, true)
      .encodeABI();
    const details = {
      from: address,
      to: collection.contractAddress,
      value: 0,
      data: data,
      nonce: nonce,
      gas: await getGasLimit(),
      gasPrice: await getGasPrice(web3),
    };
    if (walletType > 0 && !process.env.TEST_LOCAL) return details;
    return this.signTransaction(details, process.env.PRIVATEKEY, network);
  }

  async createOrder(
    userAddress: string,
    tokenId: string,
    quantity: number,
    price: number,
    receiveToken: string,
    privateKey: string,
    collectionAddress: string,
    walletType: number,
    network: Network,
  ) {
    const networkToken = this.getNetworkToken(network, receiveToken);

    console.log(
      'createOrder::',
      `tokenAddress=${collectionAddress}, network=${network.id}, receiveToken=${receiveToken}, tokenId=${tokenId}, quantity=${quantity}, price=${price}`,
    );

    const contractAddress = this.getContract(receiveToken, network);
    const approveData = null;
    const web3 = new Web3(network.rpc);
    const contractInstance = new web3.eth.Contract(
      XANALIA_DEX_ABI,
      network.xanaliaDexContract,
    );

    const data = contractInstance.methods
      .createOrder(
        collectionAddress,
        contractAddress,
        // address,
        Number(tokenId),
        convertPriceIntoWei(price, networkToken.decimal),
      )
      .encodeABI();
    const detail = await this.createDetail(
      data,
      userAddress,
      network.xanaliaDexContract,
      network,
    );
    if (walletType > 0 && !process.env.TEST_LOCAL)
      return {
        approveData: approveData,
        signData: { ...detail, networkId: network.id },
      };
    return this.signTransaction(
      detail,
      privateKey || process.env.PRIVATEKEY,
      network,
    );
  }

  async editOrder(
    itemId: number,
    price: number,
    token: string,
    address: string,
    privateKey: string,
    walletType: number,
    network: Network,
  ) {
    console.log(
      `editOrder: itemId=${itemId}, quantity=${token}, address=${address}`,
    );
    const approveData = null;
    const networkToken = this.getNetworkToken(network, token);
    const web3 = new Web3(network.rpc);
    const contractInstance = new web3.eth.Contract(
      XANALIA_DEX_ABI,
      network.xanaliaDexContract,
    );

    const data = contractInstance.methods
      .editOrder(
        itemId,
        convertPriceIntoWei(price, networkToken.decimal),
      )
      .encodeABI();

    const detail = await this.createDetail(
      data,
      address,
      network.xanaliaDexContract,
      network,
      networkToken,
    );

    if (walletType > 0 && !process.env.TEST_LOCAL)
      return {
        approveData: approveData,
        signData: { ...detail, networkId: network.id },
      };
    return this.signTransaction(
      detail,
      privateKey || process.env.PRIVATEKEY,
      network,
    );
  }

  async cancelOrder(
    itemId: number,
    token: string,
    address: string,
    privateKey: string,
    walletType: number,
    network: Network,
  ) {
    console.log(
      `cancelOrder:, itemId=${itemId}, quantity=${token}, address=${address}`,
    );
    const approveData = null;
    const web3 = new Web3(network.rpc);
    const contractInstance = new web3.eth.Contract(
      XANALIA_DEX_ABI,
      network.xanaliaDexContract,
    );
    const data = contractInstance.methods.cancelOrder(itemId).encodeABI();
    const detail = await this.createDetail(
      data,
      address,
      network.xanaliaDexContract,
      network,
    );
    if (walletType > 0 && !process.env.TEST_LOCAL)
      return {
        approveData: approveData,
        signData: { ...detail, networkId: network.id },
      };
    return this.signTransaction(
      detail,
      privateKey || process.env.PRIVATEKEY,
      network,
    );
  }

  async createBid(
    address: string,
    tokenId: string,
    quantity: number,
    price: number,
    receiveToken: string,
    privateKey: string,
    contract: string,
    walletType: number,
    network: Network,
    exprire,
  ) {
    const contractAddress = this.getContract(receiveToken, network);
    const networkToken = this.getNetworkToken(network, receiveToken);

    console.log(
      'createBid::',
      contract,
      tokenId,
      quantity,
      price,
      contractAddress,
    );

    const approveData = await this.approve(
      contractAddress,
      address,
      network.xanaliaDexContract,
      privateKey,
      network,
      receiveToken,
      walletType,
    );

    const web3 = new Web3(network.rpc);
    const contractInstance = new web3.eth.Contract(
      XANALIA_DEX_ABI,
      network.xanaliaDexContract,
    );
    const data = contractInstance.methods
      .makeOffer(
        contract,
        contractAddress,
        Number(tokenId),
        convertPriceIntoWei(price, networkToken.decimal),
        exprire,
      )
      .encodeABI();
    const detail = await this.createDetail(
      data,
      address,
      network.xanaliaDexContract,
      network,
      networkToken,
      multiplied(quantity, price),
      walletType,
      0,
      0,
    );

    if (walletType > 0 && !process.env.TEST_LOCAL)
      return {
        approveData: approveData,
        signData: { ...detail, networkId: network.id },
      };
    return this.signTransaction(detail, process.env.PRIVATEKEY2, network);
  }

  async cancelBid(
    itemId: number,
    token: string,
    address: string,
    privateKey: string,
    walletType: number,
    network: Network,
  ) {
    console.log(
      `cancelBid:, itemId=${itemId}, quantity=${token}, address=${address}`,
    );
    const approveData = null;
    const web3 = new Web3(network.rpc);
    const contractInstance = new web3.eth.Contract(
      XANALIA_DEX_ABI,
      network.xanaliaDexContract,
    );
    const data = contractInstance.methods.cancelOffer(itemId).encodeABI();
    const detail = await this.createDetail(
      data,
      address,
      network.xanaliaDexContract,
      network,
    );

    if (walletType > 0 && !process.env.TEST_LOCAL)
      return {
        approveData: approveData,
        signData: { ...detail, networkId: network.id },
      };
    return this.signTransaction(detail, process.env.PRIVATEKEY2, network);
  }

  async acceptBid(
    bidId: number,
    quantity: number,
    listOrderId: string[],
    token: string,
    address: string,
    privateKey: string,
    walletType: number,
    network: Network,
    collectionAddress: string,
    nftTokenId: number,
    isAcceptHasPutSale: number,
  ) {
    // in case of 721, array listOrderId only have 1 element
    const orderId = listOrderId.length > 0 ? listOrderId[0] : bidId;
    console.log(
      `acceptBid: bidId=${bidId}, orderId=${orderId}, address=${address}, network=${network.id}`,
    );

    const networkToken = this.getNetworkToken(network, token);

    const approveData = null;
    const web3 = new Web3(network.rpc);
    const contractInstance = new web3.eth.Contract(
      XANALIA_DEX_ABI,
      network.xanaliaDexContract,
    );
    let data;
    if (isAcceptHasPutSale == 1) {
      data = contractInstance.methods
        .acceptOfferFixedPrice(bidId, orderId)
        .encodeABI();
    }
    if (isAcceptHasPutSale == 2) {
      data = contractInstance.methods
        .acceptOfferAuction(bidId, orderId)
        .encodeABI();
    }
    if (isAcceptHasPutSale == 3) {
      data = contractInstance.methods
        .acceptOfferNotOnSale(bidId, collectionAddress, nftTokenId)
        .encodeABI();
    }
    const detail = await this.createDetail(
      data,
      address,
      network.xanaliaDexContract,
      network,
      networkToken,
    );
    if (walletType > 0 && !process.env.TEST_LOCAL)
      return {
        approveData: approveData,
        signData: { ...detail, networkId: network.id },
      };
    return this.signTransaction(detail, process.env.PRIVATEKEY, network);
  }
}
