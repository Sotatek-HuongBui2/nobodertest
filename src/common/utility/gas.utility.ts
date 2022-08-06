export async function getGasLimit() {
  return 500000;
}

export async function getGasPrice(web3) {
  const data = await web3.eth.getGasPrice();
  return Math.round(parseInt(data) * 1.5);
  // return 20e9;
}
