export type HealthStatus = "alive" | "watch" | "dead";

export type NftTrait = {
  trait_type: string;
  value: string;
};

export type CreatureDto = {
  status:
    | "none"
    | "queued"
    | "generating"
    | "ready"
    | "failed";
  spriteUrl: string | null;
  spriteCid: string | null;
  brain: Record<string, unknown>;
};

export type NftDetailDto = {
  chainId: number;
  collection: string;
  tokenId: string;
  name: string;
  imageUrl: string | null;
  minter: string;
  owner: string;
  floorAth: number;
  floorNow: number;
  holders: number;
  traits: NftTrait[];
  traitCount: number;
  rarityRank: number;
  mints: number;
  trades30d: number;
  score: number;
  status: HealthStatus;
  reasons: string[];
  creature: CreatureDto;
  colors: [string, string];
  size: number;
  tilt: number;
  seed: number;
};

export type GardenResponse = {
  chainId: number;
  query: string;
  kind: "wallet" | "collection";
  portfolioScore: number;
  counts: {
    alive: number;
    watch: number;
    dead: number;
  };
  nfts: NftDetailDto[];
  limitations: string[];
  source: "mock" | "live";
};
