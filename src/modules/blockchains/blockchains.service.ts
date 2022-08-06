import 'dotenv/config';
import { Injectable } from '@nestjs/common';
import { Collection } from '../collections/entities/collections.entity';
import { UserWallet } from '../user-wallet/entities/user-wallet.entity';
import { getGasLimit, getGasPrice } from 'src/common/utility/gas.utility';
import { decrypt } from 'src/common/utility/kms.utility';
import { Network } from '../networks/entities/network.entity';
import MARKET_ABI from './abi/market_abi.json';
import { Nfts } from '../nfts/entities/nfts.entity';
import {
  convertPriceIntoWei,
  handleRoyalty,
  removeString,
} from 'src/common/utility/common.utility';
import XANALIA_DEX_ABI from './abi/xanalia_dex_abi.json';
import { AuctionSession } from '../auction-session/entities/auction-session.entity';
import { NetworkToken } from '../network-tokens/entities/network-token.entity';
import { SaleNft } from '../sale-nft/entities/sale-nft.entity';
import moment from 'moment';
const ADMIN_ADDRESS = process.env.ADMIN_ADDRESS;

export interface SignTransaction {
  messageHash: string;
  v: string;
  r: string;
  rawTransaction: string;
  transactionHash: string;
}

const eventCreateNFTName = 'Create';
const keyForGetValueFromCreateNFTEvent = '_id';

@Injectable()
export class BlockchainsService {
  private web3Lib = require('web3');
  async createCollection(
    collection: Collection,
    userWallet: UserWallet,
  ): Promise<any> {
    const Web3 = this.web3Lib;
    const web3 = new Web3(
      new Web3.providers.HttpProvider(collection.network.rpc),
    );

    let contractInstance;

    contractInstance = new web3.eth.Contract(XANALIA_DEX_ABI);

    const data = await this.createNewCollection(
      contractInstance,
      collection.name,
      collection.symbol,
    );

    const address = userWallet.address;
    const nonce = await web3.eth.getTransactionCount(address, 'pending');

    const details = {
      from: address,
      to: collection.network.xanaliaDexContract,
      data: data,
      nonce: nonce,
      gas: collection.network.gasLimitCollection,
      gasPrice: Number(collection.network.gasPrice),
      type: collection.type,
      networkId: collection.network.id,
    };
    return { signData: details };
  }

  async createNewCollection(
    contractInstance,
    collectionName,
    collectionSymbol,
  ) {
    return contractInstance.methods
      .createXanaliaCollection(collectionName, collectionSymbol, true)
      .encodeABI();
  }

  async createDetail(
    data: string,
    address: string,
    contractAddress: string,
    web3,
  ) {
    const nonce = await web3.eth.getTransactionCount(address, 'pending');
    const detail = {
      from: address,
      to: contractAddress,
      value: 0,
      data,
      nonce,
      gas: getGasLimit(),
      gasPrice: getGasPrice(web3),
    };
    return detail;
  }

  async sendSignedTransaction(rawTransaction: string, web3) {
    console.log(
      `blockchainServices::sendSignedTransaction rawTx=${rawTransaction}`,
    );
    try {
      const tx = await web3.eth.sendSignedTransaction(rawTransaction);
      console.log(tx);
      return tx;
    } catch (e) {
      console.error(
        `blockchainServices::sendSignedTransaction rawTx=${rawTransaction} error=${e.toString()}`,
        e,
      );
      if (e.receipt) return e.receipt;
      throw e;
    }
  }

  async signTransaction(detail, privateKey: string, web3) {
    const signedTransaction = await web3.eth.accounts.signTransaction(
      detail,
      privateKey,
    );
    return this.sendSignedTransaction(signedTransaction.rawTransaction, web3);
  }

  async addCollectionMarketContract(
    address: string,
    walletType: number,
    network: Network,
  ) {
    if (walletType > 0) return;
    const Web3 = this.web3Lib;
    const provider = new Web3.providers.HttpProvider(process.env.PROVIDER_RPC);
    const web3 = await new Web3(provider);
    const contract = new web3.eth.Contract(MARKET_ABI, network.marketContract);
    const data = contract.methods
      .addPOLKANFTs(address, true, false)
      .encodeABI();
    const detail = await this.createDetail(
      data,
      ADMIN_ADDRESS,
      network.marketContract,
      web3,
    );
    const adminPrivateKey = await decrypt(
      process.env.ADMIN_ENCRYPT_PRIVATE_KEY,
    );
    return this.signTransaction(detail, adminPrivateKey, web3);
  }

  async createXanalia721(
    nfts: Nfts,
    userWallet: UserWallet,
    walletType: number,
  ) {
    console.log('---------createNfts xanalia721General---------');
    const Web3 = this.web3Lib;
    const account = userWallet.address;
    let privateKey = null;
    if (walletType === 0) {
      privateKey = await decrypt(userWallet.privateKeyEncryptedValue);
    }
    const provider = new Web3.providers.HttpProvider(nfts.network.rpc);
    const web3 = await new Web3(provider);
    const iniRoyalty = handleRoyalty(nfts.royalty);

    const [ipfsJson, nonce, gasPrice, gas] = await Promise.all([
      nfts.ipfsJson.replace(process.env.PUBLIC_IMAGE_URL_PREFIX, ""),
      web3.eth.getTransactionCount(account, 'pending'),
      getGasPrice(web3),
      getGasLimit(),
    ]);

    const contract = await new web3.eth.Contract(
      XANALIA_DEX_ABI,
      nfts.network.xanaliaDexContract,
    );

    const data = await contract.methods
      .mint(nfts.collections.contractAddress, ipfsJson, iniRoyalty)
      .encodeABI();

    const result: any = {
      from: account,
      to: nfts.network.xanaliaDexContract,
      data: data,
      gas: gas,
      gasPrice: gasPrice,
      nonce: nonce,
      networkId: nfts.networkId,
    };
    nfts.rawTransaction = JSON.stringify(result);
    await nfts.save();

    if (walletType > 0 && !process.env.TEST_LOCAL) return { signData: result };
    return this.signTransaction(result, process.env.PRIVATEKEY, web3);
  }

  async createXanalia721AndPutAuction(
    nfts: Nfts,
    userWallet: UserWallet,
    walletType: number,
    networkToken: NetworkToken,
    auctionSession: AuctionSession,
  ) {
    console.log('---------createNfts xanalia721GeneralAndPutAuction---------');
    const Web3 = this.web3Lib;
    const account = userWallet.address;
    let privateKey = null;
    if (walletType === 0) {
      privateKey = await decrypt(userWallet.privateKeyEncryptedValue);
    }
    const provider = new Web3.providers.HttpProvider(nfts.network.rpc);
    const web3 = await new Web3(provider);
    const iniRoyalty = handleRoyalty(nfts.royalty);

    const [ipfsJson, nonce, gasPrice, gas] = await Promise.all([
      nfts.ipfsJson.replace(process.env.PUBLIC_IMAGE_URL_PREFIX, ""),
      web3.eth.getTransactionCount(account, 'pending'),
      getGasPrice(web3),
      getGasLimit(),
    ]);

    const contract = await new web3.eth.Contract(
      XANALIA_DEX_ABI,
      nfts.network.xanaliaDexContract,
    );
    const data = await contract.methods
      .mintAndPutOnAuction(
        nfts.collections.contractAddress,
        ipfsJson,
        iniRoyalty,
        networkToken.contractAddress,
        convertPriceIntoWei(auctionSession.startPrice, networkToken.decimal),
        moment(auctionSession.startTime).utc().unix(),
        moment(auctionSession.endTime).utc().unix(),
      )
      .encodeABI();

    const result: any = {
      from: account,
      to: nfts.network.xanaliaDexContract,
      data: data,
      gas: gas,
      gasPrice: gasPrice,
      nonce: nonce,
      networkId: nfts.networkId,
    };
    nfts.rawTransaction = JSON.stringify(result);
    await nfts.save();
    if (walletType > 0 && !process.env.TEST_LOCAL) {
      return { signData: result };
    }
    return this.signTransaction(result, process.env.PRIVATEKEY, web3);
  }

  async createXanalia721AndPutOnSale(
    nfts: Nfts,
    userWallet: UserWallet,
    networkToken: NetworkToken,
  ) {
    console.log('---------createNfts721 and putOnSale---------');
    const Web3 = this.web3Lib;
    const account = userWallet.address;
    let privateKey = null;
    if (userWallet.type === 0) {
      privateKey = await decrypt(userWallet.privateKeyEncryptedValue);
    }
    const provider = new Web3.providers.HttpProvider(nfts.network.rpc);
    const web3 = await new Web3(provider);
    const iniRoyalty = handleRoyalty(nfts.royalty);

    const [ipfsJson, nonce, gasPrice, gas] = await Promise.all([
      nfts.ipfsJson.replace(process.env.PUBLIC_IMAGE_URL_PREFIX, ""),
      web3.eth.getTransactionCount(account, 'pending'),
      getGasPrice(web3),
      getGasLimit(),
    ]);

    const contract = await new web3.eth.Contract(
      XANALIA_DEX_ABI,
      nfts.network.xanaliaDexContract,
    );

    const data = await contract.methods
      .mintAndPutOnSale(
        nfts.collections.contractAddress,
        ipfsJson,
        iniRoyalty,
        networkToken.contractAddress,
        convertPriceIntoWei(nfts.price, networkToken.decimal),
      )
      .encodeABI();

    const result: any = {
      from: account,
      to: nfts.network.xanaliaDexContract,
      data: data,
      gas: gas,
      gasPrice: gasPrice,
      nonce: nonce,
      networkId: nfts.networkId,
    };
    nfts.rawTransaction = JSON.stringify(result);
    await nfts.save();
    if (userWallet.type > 0 && !process.env.TEST_LOCAL) {
      return { signData: result };
    }
    return this.signTransaction(result, process.env.PRIVATEKEY, web3);
  }
}
