export type Scores = {
  [address: string]: number;
};

export type Asset = {
  id: string;
  metaverseRegistry: string;
  metaverseAssetId: string;
  owner: User;
  consumer: User;
  decentralandData: DecentralandData;
};

export type MetaverseRegistry = {
  id: string;
};

export type User = {
  id: string;
};

export type DecentralandData = {
  id: string;
  isLAND: boolean;
  coordinates: string[];
};
