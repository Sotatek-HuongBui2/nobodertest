// eslint-disable-next-line @typescript-eslint/no-var-requires
console.log("Socket url:", (process.env.SOCKET_URL || 'http://localhost:4000'));
const socket = require('socket.io-client')(process.env.SOCKET_URL || 'http://localhost:4000');

const SOCKET_EVENT = {
  CREATED_NFT: 'createdNft',
  EDIT_ORDER: 'editOrder',
  CREATE_AND_SALE: 'nft/created-and-put-on-sale',
  UPDATE_PUT_AND_SALE: 'nft/updated-and-put-on-sale',
  CREATE_AND_SALE_FAVOURITES: 'nft/created-and-put-on-sale-favourites',
  CREATE_NFT_NOT_ENOUGH: 'nft/create-nft-not-enough',
  NFT_BURN: 'nft/burn',
  NFT_BURN_FAVOURITES: 'nft/burn-favourites',
  CANCEL_PUT_ON_SALE: 'nft/cancel-put-on-sale',
  CANCEL_PUT_ON_SALE_FAVOURITES: 'nft/cancel-put-on-sale-favourites',
  CREATE_AND_FARM: 'nft/created-and-put-on-farm',
  SEND_DATA_SIGN_CREATE_NFT: 'sendDataSignCreateNft',
  NFT_CREATED: 'nft/created',
  LIKE_NFT: 'nft/like',
  LIKE_NFT_SUCCESS: 'nft/like-success',
  REPORT_NFT: 'nft/report',
  BUY_NFT: 'nft/buy',
  BUY_NFT_SUCCESS: 'nft/buy-success',
  BUY_NFT_FAVOURITES: 'nft/buy-favourites',
  BUY_NFT_FOLLOWING: 'nft/buy-following',
  DONE_PUT_ON_SALE: 'donePutOnSale',
  DONE_BUY_NFT: 'doneBuyNft',
  DONE_CANCEL_NFT: 'doneCancelNft',
  DONE_MAKE_OFFER: 'doneMakeOffer',
  DONE_ACCEPT_OFFER: 'doneAcceptOffer',
  DONE_BURN_NFT: 'doneBurnNft',
  REDEEM_NFT: 'nft/redeem',
  FOLLOW_USER: 'user/follow',
  FOLLOW_USER_BACK: 'user/follow-back',
  ACCEPT_OFFER: 'nft/accept',
  ACCEPT_OFFER_SUCCESS: 'nft/accept-success',
  ACCEPT_OFFER_FAVOURITES: 'nft/accept-favourites',
  ACCEPT_OFFER_FOLLOWING: 'nft/accept-following',
  MAKE_OFFER: 'nft/make-offer',
  CANCEL_MAKE_OFFER: 'nft/cancel-make-offer',
  CANCEL_MAKE_OFFER_SUCCESS: 'nft/cancel-make-offer-success',
  IMPORT_SUCCESS: 'getNftInfo',
  REPORT: 'nft/report',
  NFT_BID: 'nft/bid-expired',
  NFT_CREATED_FOLLOWING: 'nft/created-following',
  UPDATE_PUT_AND_SALE_FOLLOWING: 'nft/updated-and-put-on-sale-following',
  CANCEL_PUT_ON_SALE_FOLLOWING: 'nft/cancel-put-on-sale-following',
  NFT_BURN_FOLLOWING: 'nft/burn-following',

  NFT_TRANSFER: 'nft/transfer',
  NFT_TRANSFER_SUCCESS: 'nft/transfer-success',
  NFT_TRANSFER_FOLLOWING: 'nft/transfer-following',
  NFT_TRANSFER_FAVOURITES: 'nft/transfer-favourites',

  AUCTION_CREATED: 'auction/created',
  AUCTION_CREATED_FOLLOWING: 'auction/created-following',
  AUCTION_CREATED_FAVOURITES: 'auction/created-favourites',
  AUCTION_CANCELED: 'auction/canceled',
  AUCTION_CANCELED_FOLLOWING: 'auction/canceled-following',
  AUCTION_CANCELED_FAVOURITES: 'auction/canceled-favourites',
  AUCTION_STARTED: 'auction/started',
  AUCTION_STARTED_FOLLOWING: 'auction/started-following',
  AUCTION_STARTED_FAVOURITES: 'auction/started-favourites',
  AUCTION_WON: 'auction/won',
  AUCTION_WON_FOLLOWING: 'auction/won-following',
  AUCTION_SOMEONE_PLACE_BID: 'auction/someone-place-bid',
  AUCTION_SOMEONE_EDIT_BID: 'auction/someone-edit-bid',
  AUCTION_RESERVE_PRICE: 'auction/pass-reserve-price',
  AUCTION_OUTBID: 'auction/outbid',
  AUCTION_ENDED_HAS_WINNER: 'auction/ended-has-winner',
  AUCTION_ENDED_NO_WINNER: 'auction/ended-no-winner',
  AUCTION_ENDED_FAVOURITES: 'auction/ended-favourites',
  AUCTION_YOU_WIN: 'auction/you-win',
  AUCTION_YOU_LOSE: 'auction/you-lose',

  USER_UPDATE_AVATAR: 'user/update-avatar',
  USER_UPDATE_BANNER: 'user/update-banner',
};

export default SOCKET_EVENT;

export async function sendToSocket(data, event: string) {
  try {
    console.log('sendToSocket::', event);
    socket.emit(event, { data });
  } catch (error) {
    console.log('sendToSocket::error', error);
  }
}

export function createSocketData(
  fromUser,
  toUser: Array<number>,
  action: string,
  nftId,
  saleNftId,
  listAddress: Array<string> = [],
) {
  return {
    fromUser: fromUser,
    toUser: toUser,
    action: action,
    nftId: nftId,
    saleNftId: saleNftId,
    listAddress: listAddress,
  };
}
