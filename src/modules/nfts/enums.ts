export enum Market {
  NO_MARKET,
  COMMON_MARKET,
  TOP_MARKET,
}

export enum NftStatus {
  PENDING,
  DONE,
  FAIL,
  BURNED_ALL,
  CENSORED,
}

export enum NftType {
  NONE,
  SALE,
  AUCTION,
  FARM,
}

export enum IsCreated {
  NO,
  YES,
}

export enum StandardType {
  ERC_1155,
  ERC_721,
}

export enum NftFeature {
  NO,
}

export enum NftCurrency {
  ETH = 'ETH',
  USDT = 'USDT',
  USD = 'USD',
}

export enum NFT_CATEGORIES {
  ART = 1,
  IMAGE = 2,
  GIF = 3,
  VIDEO = 4,
  AUDIO = 5,
}

export enum NFT_MARKET_STATUS {
  NOT_ON_SALE = 0,
  ON_FIX_PRICE = 1,
  ON_AUCTION = 2,
  CANCEL_AUCTION = 3,
  IMCOMMING_AUCTION = 4,
  END_AUCTION = 5
}

export enum NFT_DURATION {
  ALL = 0,
  DAY = 1,
  WEEK = 7,
  MONTH = 30
}

export enum FILTER_NFT_MARKET {
  MOST_LIKE = 0,
  ON_SALE = 1,
  RECENTLY_CREATED = 2,
  LOW_TO_HIGH = 3,
  HIGH_TO_LOW = 4,
  ON_AUTION = 5
}

export enum FILTER_NFT_CATEGORY {
  TRENDING = 0,
  ART = 1,
  IMAGE = 2,
  GIF = 3,
  MOVIE = 4,
  MUSIC = 5
}
