import type { NftHealth, Status } from "./data";

export type GardenApiNft = {
  chainId: number;
  collection: string;
  tokenId: string;
  name: string;
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
  creature?: {
    status: string;
    spriteUrl: string | null;
    brain?: Record<string, unknown>;
  };
};

export type GardenApiResponse = {
  chainId: number;
  query: string;
  kind: "wallet" | "collection";
  portfolioScore: number;
  counts: { alive: number; watch: number; dead: number };
  nfts: GardenApiNft[];
  limitations?: string[];
  source: "mock" | "live";
};

/**
 * Prefer same-origin `/api` so:
 * - local Vite proxy → backend :8787
 * - Vercel serverless → /api
 * Override with VITE_GARDEN_API_URL when needed.
 */
export function getApiBase(): string {
  const explicit = import.meta.env.VITE_GARDEN_API_URL as string | undefined;
  if (explicit && explicit.trim()) return explicit.replace(/\/$/, "");
  return "/api";
}

function mapNft(raw: GardenApiNft, index: number): NftHealth {
  return {
    id: index + 1,
    tokenId: Number(raw.tokenId) || 1000 + index,
    name: raw.name,
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
  };
}

export async function fetchGarden(query: string, chainId?: number): Promise<{
  nfts: NftHealth[];
  source: string;
  limitations: string[];
  kind: "wallet" | "collection";
  portfolioScore: number;
}> {
  const q = query.trim() || "0x7d3A5a0F56f2E9fb000000000000000000000001";
  // Wallet path accepts any seed string (matches mock behaviour for offline demos).
  const path = `/v1/garden/wallet/${encodeURIComponent(q)}`;
  const url = new URL(`${getApiBase()}${path}`, window.location.origin);
  if (chainId) url.searchParams.set("chainId", String(chainId));

  const res = await fetch(url.toString(), {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    throw new Error(`Garden API ${res.status}: ${await res.text()}`);
  }
  const body = (await res.json()) as GardenApiResponse;
  return {
    nfts: body.nfts.map(mapNft),
    source: body.source,
    limitations: body.limitations || [],
    kind: body.kind,
    portfolioScore: body.portfolioScore,
  };
}

export async function fetchGardenCollection(collection: string, chainId?: number) {
  const q = collection.trim();
  const url = new URL(`${getApiBase()}/v1/garden/collection/${encodeURIComponent(q)}`, window.location.origin);
  if (chainId) url.searchParams.set("chainId", String(chainId));
  const res = await fetch(url.toString(), { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`Garden API ${res.status}`);
  const body = (await res.json()) as GardenApiResponse;
  return {
    nfts: body.nfts.map(mapNft),
    source: body.source,
    limitations: body.limitations || [],
    kind: body.kind as "wallet" | "collection",
    portfolioScore: body.portfolioScore,
  };
}

export async function queueCreature(params: {
  chainId: number;
  collection: string;
  tokenId: string | number;
  persona?: string;
}) {
  const url = `${getApiBase()}/v1/nfts/${params.chainId}/${params.collection}/${params.tokenId}/creature`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ persona: params.persona }),
  });
  if (!res.ok) throw new Error(`Creature queue failed: ${res.status}`);
  return res.json();
}
