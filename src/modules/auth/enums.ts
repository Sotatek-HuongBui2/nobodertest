export enum authProviders {
  BASE = 1,
  GOOGLE,
  FACEBOOK,
}

export enum userStatus {
  INACTIVE,
  ACTIVE,
}

export enum CommonStatus {
  NOT_ENABLE,
  ENABLE,
}

export enum NFTGroups {
  Farming = 1,
  Sale,
  Likes,
  Owner,
}

export type socialProviders = authProviders.GOOGLE | authProviders.FACEBOOK;
