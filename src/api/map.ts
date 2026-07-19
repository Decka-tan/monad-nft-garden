import type { NftHealth } from "../types";
import type { ApiNft } from "./types";

export function mapApiNft(raw: ApiNft, index: number): NftHealth {
  return {
    id: index + 1,
    tokenId: Number(raw.tokenId) || 1000 + index,
    name: raw.name,
    imageUrl: raw.imageUrl ?? null,
    tokenUri: raw.tokenUri ?? null,
    owner: raw.owner,
    seed: raw.seed,
    score: raw.score,
    status: raw.status,
    floorAth: raw.floorAth,
    floorNow: raw.floorNow,
    trades: raw.trades30d,
    holders: raw.holders,
    traits: raw.traitCount,
    rarity: raw.rarityRank,
    mints: raw.mints,
    minter: raw.minter,
    colors: raw.colors,
    size: raw.size,
    tilt: raw.tilt,
    collection: raw.collection,
    reasons: raw.reasons,
    creatureStatus: raw.creature?.status,
    spriteUrl: raw.creature?.spriteUrl ?? null,
    proofUpdatedAt: raw.proofUpdatedAt ?? null,
    dataOrigin: raw.dataOrigin,
  };
}
