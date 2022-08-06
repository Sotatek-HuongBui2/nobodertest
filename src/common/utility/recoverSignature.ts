const Web3 = require('web3');
const web3 = new Web3(new Web3.providers.HttpProvider(process.env.PROVIDER_RPC));
import * as ethUtil from 'ethereumjs-util';
import { convertUtf8ToHex } from '@walletconnect/utils';

const defaultMessage = 'Welcome. By signing this message you are verifying your digital identity. This is completely secure and does not cost anything!';
const defaultMessageAdmin = 'Welcome! Admin'
const WALLET_TYPE = {
  metaMask: 1,
  walletConnect: 2,
};

export async function recoverSignature(signature: string, type: number, nonce: number) {
  let address = null;
  let subMess = '';
  // if (nonce > 0) {
  //   subMess = ` Nonce: ${nonce}`;
  // }
  if (type === WALLET_TYPE.metaMask) {
    address = await recoverAddressMetaMask(signature, subMess);
  } else if (type === WALLET_TYPE.walletConnect) {
    address = await recoverAddressWalletConnect(signature, subMess);
  }
  return address;
}

export async function recoverSignatureAdmin(signature: string, type: number, nonce: number) {
  let address = null;
  let subMess = '';
  // if (nonce > 0) {
  //   subMess = ` Nonce: ${nonce}`;
  // }
  if (type === WALLET_TYPE.metaMask) {
    address = await recoverAddressMetaMaskAdmin(signature, subMess);
  } else if (type === WALLET_TYPE.walletConnect) {
    address = await recoverAddressWalletConnectAdmin(signature, subMess);
  }
  return address;
}

export async function signMessage(privateKey: string, message: string) {
  return web3.eth.accounts.sign(message, privateKey);
}

async function recoverAddressMetaMask(signature: string, subMess: string) {
  //console.log('recoverAddressMetaMask', signature);
  // console.log(defaultMessage + subMess);
  return web3.eth.accounts.recover(defaultMessage, signature);
}

async function recoverAddressMetaMaskAdmin(signature: string, subMess: string) {
  return web3.eth.accounts.recover(defaultMessageAdmin, signature);
}

async function recoverAddressWalletConnect(signature: string, subMess: string) {
  console.log('recoverAddressWalletConnect', signature);
  const hash = hashPersonalMessage(defaultMessage + subMess);
  return recoverAddress(signature, hash);
}

async function recoverAddressWalletConnectAdmin(signature: string, subMess: string) {
  console.log('recoverAddressWalletConnect', signature);
  const hash = hashPersonalMessage(defaultMessageAdmin + subMess);
  return recoverAddress(signature, hash);
}

function hashPersonalMessage(msg: string): string {
  const data = encodePersonalMessage(msg);
  const buf = ethUtil.toBuffer(data);
  const hash = ethUtil.keccak256(buf);
  return ethUtil.bufferToHex(hash);
}

function encodePersonalMessage(msg: string): string {
  const data = ethUtil.toBuffer(convertUtf8ToHex(msg));
  const buf = Buffer.concat([
    Buffer.from('\u0019Ethereum Signed Message:\n' + data.length.toString(), 'utf8'),
    data,
  ]);
  return ethUtil.bufferToHex(buf);
}

function recoverAddress(sig: string, hash: string): string {
  const params = ethUtil.fromRpcSig(sig);
  const result = ethUtil.ecrecover(ethUtil.toBuffer(hash), params.v, params.r, params.s);
  const signer = ethUtil.bufferToHex(ethUtil.publicToAddress(result));
  console.log(signer);
  return signer;
}
