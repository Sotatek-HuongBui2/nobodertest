import axios from 'axios';
import BigNumber from 'bignumber.js';
BigNumber.config({
  EXPONENTIAL_AT: 40,
});

export async function getExternalGas(url: string) {
  const result = await axios.get(url, {
    validateStatus: function (status) {
      return status >= 200 && status < 500; // default
    },
  });
  return result.data;
}

export async function removeString(input: string, removedPart: string) {
  if (input) {
    return input.substring(removedPart.length);
  }
}

export async function getDataFromURI(uri: string) {
  let response;
  uri = uri.replace('ipfs://', 'https://ipfs.io/ipfs/');
  try {
    response = await axios.get(uri);
    return response.data;
  } catch (error) {
    console.log('getDataFromURI::error', uri);
    throw new Error("Can't not get uri data");
  }
}

export function convertPriceIntoWei(price: number, unit = 6) {
  return new BigNumber(new BigNumber(Number(price)).toNumber())
    .multipliedBy(Math.pow(10, unit))
    .toString();
}

export function multiplied(a: number, b: number) {
  return new BigNumber(new BigNumber(a).toNumber()).multipliedBy(b).toNumber();
}

export function convertWeiIntoPrice(wei: number, unit = 6) {
  return new BigNumber(
    new BigNumber(wei).dividedBy(Math.pow(10, unit)),
  ).toNumber();
}

export function minusPrice(numberOne, numberTwo) {
  return new BigNumber(numberOne).minus(numberTwo).toNumber();
}

export function getPagination(data, totalItem, totalPage, currentPage) {
  return {
    data,
    total: parseInt(totalItem),
    totalPage: parseInt(totalPage),
    currentPage: parseInt(currentPage),
  };
}

export function handleRoyalty(royalty) {
  return (Number(royalty) * 10000) / 100;
}

export function compareAddress(address1?: string, address2?: string) {
  if(!address1 || !address2) return false
  return address1.toLowerCase() === address2.toLowerCase()
}