export enum userType {
  COMMON,
  VERIFIED,
  TOP_VERIFIED,
}

export enum UserVerify {
  FALSE,
  TRUE,
}

export enum IsNonCrypto {
  FALSE,
  TRUE,
}

export enum FavoritesType {
  followers = 'followers',
  following = 'following',
}

export enum CategoryNftUser {
  CREATE = 1,
  OWNER = 2
}

export enum NotificationActionStatus {
  NFT_CREATION,
  NFT_SALE,
  ONWNED_ASSET_UPDATE,
  AUCTION_EXPIRATION,
  BID_ACTIVITY,
  OUTBID,
  MINIMUM_BID_MET,
  FOLLOW_AND_LIKE,
  MESSAGES,
}
