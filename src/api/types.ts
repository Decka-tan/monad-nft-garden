import type { Status } from "../types";

export type ApiCreature = {
  status: string;
  spriteUrl: string | null;
  brain?: Record<string, unknown>;
};

export type ApiNft = {
  chainId: number;
  collection: string;
  tokenId: string;
  name: string;
  imageUrl?: string | null;
  tokenUri?: string | null;
  minter: string;
  owner: string;
  floorAth: number;
  floorNow: number;
  holders: number;
  traitCount: number;
  rarityRank: number;
  mints: number;
  trades30d: number;
  score: number;
  status: Status;
  reasons: string[];
  colors: [string, string];
  size: number;
  tilt: number;
  seed: number;
  proofUpdatedAt?: string | null;
  dataOrigin?: "demo" | "live";
  creature?: ApiCreature;
};

export type ApiGarden = {
  chainId: number;
  query: string;
  kind: "wallet" | "collection";
  portfolioScore: number;
  counts: {
    alive: number;
    watch: number;
    dead: number;
  };
  nfts: ApiNft[];
  limitations?: string[];
  source: "mock" | "live";
};
