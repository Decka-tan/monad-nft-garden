import { config } from "../config.js";

export type HealthStatus = "alive" | "watch" | "dead";

export type NftTrait = { trait_type: string; value: string };

export type CreatureDto = {
  status: "none" | "queued" | "generating" | "ready" | "failed";
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
  /** FE sandbox creature cosmetics (deterministic) */
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
  counts: { alive: number; watch: number; dead: number };
  nfts: NftDetailDto[];
  limitations: string[];
  source: "mock" | "live";
};

const names = [
  "Molandak Bloom",
  "Chog Seedling",
  "Purple Hatch",
  "Block Sprite",
  "Gas Fern",
  "Moyaki Pod",
  "Nonce Bud",
  "Parallel Root",
  "Mint Wisp",
  "Trait Moss",
  "Monadling",
  "Rarity Beet",
  "Finality Dew",
  "Pixel Bract",
  "Holder Vine",
  "Floor Sprout",
  "Epoch Bulb",
  "Calldata Puff",
  "Archive Leaf",
  "Bloom Blob",
];

const palette: Array<[string, string]> = [
  ["#f45fa5", "#91f36c"],
  ["#86d5ff", "#f3c45b"],
  ["#c184ff", "#61e3a5"],
  ["#ff7b54", "#f4df6a"],
  ["#69f0d8", "#a8ff60"],
  ["#ff8bd1", "#6bd3ff"],
];

export function hashString(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function randomFrom(seed: number, min: number, max: number) {
  const value = Math.sin(seed) * 10000;
  return Math.floor((value - Math.floor(value)) * (max - min + 1)) + min;
}

export function scoreHealth(input: {
  floorAth: number;
  floorNow: number;
  trades30d: number;
  holders: number;
  rarityRank: number;
}) {
  const resilience = Math.round((input.floorNow / Math.max(input.floorAth, 0.01)) * 100);
  const tradeScore = Math.min(100, input.trades30d * 2);
  const holderScore = Math.min(100, Math.round(input.holders / 42));
  const rarityScore = Math.max(20, 100 - Math.round(input.rarityRank / 10));
  const score = Math.round(resilience * 0.4 + tradeScore * 0.25 + holderScore * 0.2 + rarityScore * 0.15);
  const status: HealthStatus = score >= 70 ? "alive" : score >= 46 ? "watch" : "dead";
  const reasons = [
    `Floor resilience ${resilience}% (now ${input.floorNow} / ATH ${input.floorAth})`,
    `Trade activity score ${tradeScore} from ${input.trades30d} trades (30d window)`,
    `Holder spread score ${holderScore} from ${input.holders} holders`,
    `Rarity signal score ${rarityScore} (rank ${input.rarityRank})`,
  ];
  return { score, status, reasons };
}

function brainFor(status: HealthStatus, name: string, seed: number) {
  const mood = status === "alive" ? "lively" : status === "watch" ? "wary" : "dormant";
  return {
    seed,
    mood,
    persona: `${name} feels ${mood} in the Monad garden.`,
    prompt: `pixel art creature, 64x64, ${mood}, neon garden, monad purple accents, based on NFT ${name}`,
    source: "hardcoded",
    version: 1,
  };
}

/** Deterministic mock garden — same spirit as FE `src/data.ts`, richer API shape. */
export function mockGarden(kind: "wallet" | "collection", query: string, chainId = config.defaultChainId): GardenResponse {
  const base = hashString(`${chainId}:${kind}:${query.toLowerCase() || "monad"}`);
  const collection =
    kind === "collection" && query.startsWith("0x")
      ? query.toLowerCase()
      : `0x${(base >>> 0).toString(16).padStart(8, "0")}${"0".repeat(32)}`.slice(0, 42);

  const nfts: NftDetailDto[] = names.map((name, index) => {
    const seed = base + index * 9973;
    const floorAth = randomFrom(seed, 4, 18) + randomFrom(seed + 3, 0, 9) / 10;
    const floorNow = Math.max(0.2, floorAth * (randomFrom(seed + 1, 34, 94) / 100));
    const trades30d = randomFrom(seed + 2, 0, 82);
    const holders = randomFrom(seed + 4, 110, 4200);
    const traitCount = randomFrom(seed + 5, 4, 14);
    const rarityRank = randomFrom(seed + 6, 1, 980);
    const mints = randomFrom(seed + 7, 18, 9900);
    const { score, status, reasons } = scoreHealth({ floorAth, floorNow, trades30d, holders, rarityRank });
    const pair = palette[index % palette.length];
    const tokenId = String(1000 + index);
    const minter = `0x${(seed + 11).toString(16).padStart(40, "0").slice(0, 40)}`;
    const owner =
      kind === "wallet" && query.startsWith("0x")
        ? query.toLowerCase()
        : `0x${(seed + 99).toString(16).padStart(40, "0").slice(0, 40)}`;

    const traits: NftTrait[] = Array.from({ length: Math.min(traitCount, 6) }, (_, t) => ({
      trait_type: ["Background", "Body", "Eyes", "Aura", "Item", "Mutation"][t],
      value: `Trait-${randomFrom(seed + 20 + t, 1, 40)}`,
    }));

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
        spriteUrl: `/assets/creatures/creature-${String((index % 20) + 1).padStart(2, "0")}.png`,
        spriteCid: null,
        brain: brainFor(status, name, seed),
      },
      colors: pair,
      size: 42 + randomFrom(seed + 8, 0, 18),
      tilt: randomFrom(seed + 9, -12, 12),
      seed,
    };
  });

  const counts = nfts.reduce(
    (acc, nft) => {
      acc[nft.status] += 1;
      return acc;
    },
    { alive: 0, watch: 0, dead: 0 },
  );
  const portfolioScore = Math.round(nfts.reduce((s, n) => s + n.score, 0) / nfts.length);

  return {
    chainId,
    query,
    kind,
    portfolioScore,
    counts,
    nfts,
    limitations: [
      "MOCK_MODE: stats are deterministic offline demos, not live marketplace data",
      "Creature sprites are placeholder paths until generation worker is wired",
      "SMTP/email N/A — this is an NFT sandbox API",
    ],
    source: "mock",
  };
}

export function mockNftDetail(chainId: number, collection: string, tokenId: string): NftDetailDto | null {
  const garden = mockGarden("collection", collection, chainId);
  return garden.nfts.find((n) => n.tokenId === tokenId) ?? null;
}
