export enum CollectionStatus {
  PENDING,
  DONE,
  FAIL,
}

export enum CollectionLaunchpadStatus {
  HIDDEN = 0,
  VISIBLE = 1,
}

export enum collectionType {
  xanalia1155Artist,
  xanalia1155General,
  xanalia1155, // farm
  erc721,
  xanalia721,
  xanalia721Artist,
  default
}

export enum CollectionSort {
  VOLUME_DESC,
  VOLUME_ASC,
  PRICE_CHANGE_DAY_DESC,
  PRICE_CHANGE_DAY_ASC,
  PRICE_CHANGE_WEEK_DESC,
  PRICE_CHANGE_WEEK_ASC,
  FLOOR_DESC,
  FLOOR_ASC,
  OWNERS_DESC,
  OWNERS_ASC,
  ITEMS_DESC,
  ITEMS_ASC,
}

export const FindCollectionVolumn = {
  LAST_ONE_DAY: 'LAST_ONE_DAY',
  LAST_TWO_DAY: 'LAST_TWO_DAY',
  LAST_SEVEN_DAY: 'LAST_SEVEN_DAY',
  LAST_TWO_WEEKS: 'LAST_TWO_WEEKS',
};

export const CalculateUpDownVolume = {
  '24H': '24H',
  '7DAY': '7DAY',
};
