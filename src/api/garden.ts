import type { GardenLoadResult } from "../types";
import { getJson, postJson } from "./client";
import { mapApiNft } from "./map";
import type { ApiGarden } from "./types";

const DEMO =
  "0x7d3A5a0F56f2E9fb000000000000000000000001";

function toResult(body: ApiGarden): GardenLoadResult {
  return {
    nfts: body.nfts.map(mapApiNft),
    source: body.source,
    limitations: body.limitations || [],
    kind: body.kind,
    portfolioScore: body.portfolioScore,
  };
}

export async function fetchGarden(
  query: string,
  chainId?: number,
): Promise<GardenLoadResult> {
  const q = query.trim() || DEMO;
  let path = `/v1/garden/wallet/${encodeURIComponent(q)}`;
  if (chainId) path += `?chainId=${chainId}`;
  const body = await getJson<ApiGarden>(path);
  return toResult(body);
}

export async function fetchGardenCollection(
  collection: string,
  chainId?: number,
): Promise<GardenLoadResult> {
  const q = collection.trim();
  let path =
    `/v1/garden/collection/${encodeURIComponent(q)}`;
  if (chainId) path += `?chainId=${chainId}`;
  const body = await getJson<ApiGarden>(path);
  return toResult(body);
}

export async function queueCreature(params: {
  chainId: number;
  collection: string;
  tokenId: string | number;
  persona?: string;
}) {
  const { chainId, collection, tokenId, persona } = params;
  const path =
    `/v1/nfts/${chainId}/${collection}/${tokenId}/creature`;
  return postJson<{ creature?: { status?: string } }>(
    path,
    { persona },
  );
}
