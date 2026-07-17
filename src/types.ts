export type Status = "alive" | "watch" | "dead";

export type NftHealth = {
  id: number;
  tokenId: number;
  name: string;
  seed: number;
  score: number;
  status: Status;
  floorAth: number;
  floorNow: number;
  trades: number;
  holders: number;
  traits: number;
  rarity: number;
  mints: number;
  minter: string;
  colors: [string, string];
  size: number;
  tilt: number;
  collection?: string;
  reasons?: string[];
  creatureStatus?: string;
  spriteUrl?: string | null;
};

export type ChainState = {
  account: string;
  chainId: string;
  owner: string;
  txHash: string;
  onchainScore: string;
  status: string;
};

export type GardenLoadResult = {
  nfts: NftHealth[];
  source: string;
  limitations: string[];
  kind: "wallet" | "collection";
  portfolioScore: number;
};
