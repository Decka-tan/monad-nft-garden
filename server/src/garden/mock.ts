import { config } from "../config.js";
import { hashString, randomFrom } from "../lib/hash.js";
import {
  COLOR_PAIRS,
  CREATURE_NAMES,
  MOCK_LIMITS,
  TRAIT_TYPES,
} from "./names.js";
import { brainFor, scoreHealth } from "./health.js";
import type {
  GardenResponse,
  NftDetailDto,
  NftTrait,
} from "../types.js";

function fakeAddress(seed: number) {
  const hex = (seed >>> 0).toString(16).padStart(40, "0");
  return `0x${hex.slice(0, 40)}`;
}

function buildNft(
  base: number,
  index: number,
  chainId: number,
  collection: string,
  ownerHint: string | null,
): NftDetailDto {
  const name = CREATURE_NAMES[index];
  const seed = base + index * 9973;

  const floorAth =
    randomFrom(seed, 4, 18) +
    randomFrom(seed + 3, 0, 9) / 10;
  const floorNow = Math.max(
    0.2,
    floorAth * (randomFrom(seed + 1, 34, 94) / 100),
  );
  const trades30d = randomFrom(seed + 2, 0, 82);
  const holders = randomFrom(seed + 4, 110, 4200);
  const traitCount = randomFrom(seed + 5, 4, 14);
  const rarityRank = randomFrom(seed + 6, 1, 980);
  const mints = randomFrom(seed + 7, 18, 9900);

  const { score, status, reasons } = scoreHealth({
    floorAth,
    floorNow,
    trades30d,
    holders,
    rarityRank,
  });

  const tokenId = String(1000 + index);
  const minter = fakeAddress(seed + 11);
  const owner = ownerHint || fakeAddress(seed + 99);

  const traits: NftTrait[] = Array.from(
    { length: Math.min(traitCount, 6) },
    (_, t) => ({
      trait_type: TRAIT_TYPES[t],
      value: `Trait-${randomFrom(seed + 20 + t, 1, 40)}`,
    }),
  );

  const spriteIdx = String((index % 20) + 1).padStart(2, "0");

  return {
    chainId,
    collection,
    tokenId,
    name,
    imageUrl: null,
    minter,
    owner,
    floorAth: Number(floorAth.toFixed(2)),
    floorNow: Number(floorNow.toFixed(2)),
    holders,
    traits,
    traitCount,
    rarityRank,
    mints,
    trades30d,
    score,
    status,
    reasons,
    creature: {
      status: "ready",
      spriteUrl: `/assets/creatures/creature-${spriteIdx}.png`,
      spriteCid: null,
      brain: brainFor(status, name, seed),
    },
    colors: COLOR_PAIRS[index % COLOR_PAIRS.length],
    size: 42 + randomFrom(seed + 8, 0, 18),
    tilt: randomFrom(seed + 9, -12, 12),
    seed,
  };
}

export function mockGarden(
  kind: "wallet" | "collection",
  query: string,
  chainId = config.defaultChainId,
): GardenResponse {
  const seedKey =
    `${chainId}:${kind}:${query.toLowerCase() || "monad"}`;
  const base = hashString(seedKey);

  let collection = fakeAddress(base);
  if (kind === "collection" && query.startsWith("0x")) {
    collection = query.toLowerCase();
  }

  const ownerHint =
    kind === "wallet" && query.startsWith("0x")
      ? query.toLowerCase()
      : null;

  const nfts = CREATURE_NAMES.map((_, index) =>
    buildNft(base, index, chainId, collection, ownerHint),
  );

  if (
    chainId === 10143 &&
    collection === "0xe7f129fac3a5eeca642af10f93adee8c969fdb03"
  ) {
    nfts[0].tokenId = "3";
  }

  const counts = { alive: 0, watch: 0, dead: 0 };
  for (const nft of nfts) counts[nft.status] += 1;

  const total = nfts.reduce((s, n) => s + n.score, 0);
  const portfolioScore = Math.round(total / nfts.length);

  return {
    chainId,
    query,
    kind,
    portfolioScore,
    counts,
    nfts,
    limitations: [...MOCK_LIMITS],
    source: "mock",
  };
}

export function mockNftDetail(
  chainId: number,
  collection: string,
  tokenId: string,
): NftDetailDto | null {
  const garden = mockGarden(
    "collection",
    collection,
    chainId,
  );
  return garden.nfts.find((n) => n.tokenId === tokenId) ?? null;
}
