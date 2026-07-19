import {
  createPublicClient,
  encodeAbiParameters,
  getAddress,
  http,
  isAddress,
  keccak256,
  parseAbi,
  type Address,
} from "viem";
import { config } from "../config.js";
import { COLOR_PAIRS } from "../garden/names.js";
import { hashString, randomFrom } from "../lib/hash.js";
import type {
  GardenResponse,
  HealthStatus,
  NftDetailDto,
  NftTrait,
} from "../types.js";

const erc721Abi = parseAbi([
  "function name() view returns (string)",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function tokenURI(uint256 tokenId) view returns (string)",
]);

const passportAbi = parseAbi([
  "function checkIns(bytes32) view returns (uint64 updatedAt, uint16 healthScore, string spriteCid, string dataCid)",
]);

const zeroAddress =
  "0x0000000000000000000000000000000000000000";

type IndexedItem = {
  contractAddress: string;
  tokenId: string;
  name?: string;
  image?: string;
};

type BlockVisionCollection = {
  contractAddress: string;
  name?: string;
  ercStandard?: string;
  items?: IndexedItem[];
};

type BlockVisionWalletResponse = {
  code?: number;
  message?: string;
  reason?: string;
  result?: {
    data?: BlockVisionCollection[];
  };
};

export class LiveDataError extends Error {
  constructor(
    message: string,
    readonly status = 502,
  ) {
    super(message);
  }
}

function rpcUrl(chainId: number) {
  if (chainId === 143) return config.monadMainnetRpcUrl;
  if (chainId === 10143) return config.monadTestnetRpcUrl;
  throw new LiveDataError(`Unsupported Monad chain ${chainId}.`, 400);
}

function passportAddress(chainId: number) {
  return chainId === 143
    ? config.passportMainnetAddress
    : config.passportTestnetAddress;
}

function blockvisionKey(chainId: number) {
  return chainId === 143
    ? config.blockvisionMainnetApiKey
    : config.blockvisionTestnetApiKey;
}

function publicUri(uri: string) {
  if (uri.startsWith("ipfs://")) {
    return `https://ipfs.io/ipfs/${uri.slice(7)}`;
  }
  return uri;
}

function parseDataMetadata(uri: string) {
  const comma = uri.indexOf(",");
  if (comma < 0) return null;
  const header = uri.slice(0, comma);
  const body = uri.slice(comma + 1);
  const json = header.includes(";base64")
    ? Buffer.from(body, "base64").toString("utf8")
    : decodeURIComponent(body);
  return JSON.parse(json) as {
    name?: string;
    image?: string;
    attributes?: Array<{
      trait_type?: string;
      value?: string | number;
    }>;
  };
}

async function readMetadata(uri: string) {
  if (!uri) return null;
  if (uri.startsWith("data:application/json")) {
    try {
      return parseDataMetadata(uri);
    } catch {
      return null;
    }
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8_000);
  try {
    const response = await fetch(publicUri(uri), {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });
    if (!response.ok) return null;
    return (await response.json()) as {
      name?: string;
      image?: string;
      attributes?: Array<{
        trait_type?: string;
        value?: string | number;
      }>;
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

function careHealth(updatedAt: bigint) {
  if (updatedAt === 0n) {
    return {
      score: 28,
      status: "dead" as HealthStatus,
      reason:
        "Ownership and metadata are live. No Proof of Care has been recorded yet.",
    };
  }

  const ageMs =
    Date.now() - Number(updatedAt) * 1_000;
  const ageDays = ageMs / 86_400_000;
  if (ageDays <= 1) {
    return {
      score: 92,
      status: "alive" as HealthStatus,
      reason: "Ownership is verified and this NFT was cared for in the last 24 hours.",
    };
  }
  if (ageDays <= 7) {
    return {
      score: 68,
      status: "watch" as HealthStatus,
      reason: "Ownership is verified. The latest Proof of Care is less than one week old.",
    };
  }
  return {
    score: 38,
    status: "dead" as HealthStatus,
    reason: "Ownership is verified, but the latest Proof of Care is older than one week.",
  };
}

function summarize(
  query: string,
  kind: "wallet" | "collection",
  chainId: number,
  nfts: NftDetailDto[],
): GardenResponse {
  const counts = { alive: 0, watch: 0, dead: 0 };
  for (const nft of nfts) counts[nft.status] += 1;
  const portfolioScore = nfts.length
    ? Math.round(
        nfts.reduce((sum, nft) => sum + nft.score, 0) /
          nfts.length,
      )
    : 0;

  return {
    chainId,
    query,
    kind,
    portfolioScore,
    counts,
    nfts,
    limitations: [
      "Live ownership, metadata, and Proof of Care data. Market prices are not estimated.",
    ],
    source: "live",
  };
}

export async function readLiveNft(params: {
  chainId: number;
  collection: string;
  tokenId: string;
  indexedName?: string;
  indexedImage?: string;
}) {
  if (!isAddress(params.collection)) {
    throw new LiveDataError("Collection must be a valid 0x address.", 400);
  }

  let tokenId: bigint;
  try {
    tokenId = BigInt(params.tokenId);
  } catch {
    throw new LiveDataError("Token ID must be an integer.", 400);
  }

  const collection = getAddress(params.collection);
  const client = createPublicClient({
    transport: http(rpcUrl(params.chainId)),
  });
  const bytecode = await client.getBytecode({ address: collection });
  if (!bytecode) {
    throw new LiveDataError(
      "No contract exists at this address on the selected network.",
      404,
    );
  }

  const [collectionNameResult, ownerResult, uriResult] =
    await Promise.allSettled([
      client.readContract({
        address: collection,
        abi: erc721Abi,
        functionName: "name",
      }),
      client.readContract({
        address: collection,
        abi: erc721Abi,
        functionName: "ownerOf",
        args: [tokenId],
      }),
      client.readContract({
        address: collection,
        abi: erc721Abi,
        functionName: "tokenURI",
        args: [tokenId],
      }),
    ]);

  if (ownerResult.status === "rejected") {
    throw new LiveDataError(
      "Token was not found or this contract is not ERC-721.",
      404,
    );
  }

  const tokenUri =
    uriResult.status === "fulfilled" ? uriResult.value : "";
  const metadata = await readMetadata(tokenUri);
  const attributes = metadata?.attributes || [];
  const traits: NftTrait[] = attributes.slice(0, 12).map(
    (attribute, index) => ({
      trait_type: attribute.trait_type || `Trait ${index + 1}`,
      value: String(attribute.value ?? "Unknown"),
    }),
  );

  let updatedAt = 0n;
  const passport = passportAddress(params.chainId);
  if (isAddress(passport) && passport.toLowerCase() !== zeroAddress) {
    const key = keccak256(
      encodeAbiParameters(
        [
          { name: "collection", type: "address" },
          { name: "tokenId", type: "uint256" },
        ],
        [collection, tokenId],
      ),
    );
    try {
      const checkIn = await client.readContract({
        address: getAddress(passport),
        abi: passportAbi,
        functionName: "checkIns",
        args: [key],
      });
      updatedAt = checkIn[0];
    } catch {
      updatedAt = 0n;
    }
  }

  const health = careHealth(updatedAt);
  const seed = hashString(
    `${params.chainId}:${collection.toLowerCase()}:${tokenId}`,
  );
  const collectionName =
    collectionNameResult.status === "fulfilled"
      ? collectionNameResult.value
      : "ERC-721";
  const image =
    metadata?.image || params.indexedImage || "";

  return {
    chainId: params.chainId,
    collection,
    tokenId: tokenId.toString(),
    name:
      metadata?.name ||
      params.indexedName ||
      `${collectionName} #${tokenId}`,
    imageUrl: image ? publicUri(image) : null,
    tokenUri: tokenUri || null,
    minter: zeroAddress,
    owner: ownerResult.value,
    floorAth: 0,
    floorNow: 0,
    holders: 0,
    traits,
    traitCount: traits.length,
    rarityRank: 0,
    mints: 0,
    trades30d: 0,
    score: health.score,
    status: health.status,
    reasons: [health.reason],
    creature: {
      status: "ready" as const,
      spriteUrl: `/assets/creatures/creature-${String((seed % 20) + 1).padStart(2, "0")}.png`,
      spriteCid: null,
      brain: {
        source: "onchain-identity",
        chainId: params.chainId,
        collection,
        tokenId: tokenId.toString(),
      },
    },
    colors: COLOR_PAIRS[seed % COLOR_PAIRS.length],
    size: 48 + randomFrom(seed, 0, 12),
    tilt: randomFrom(seed + 1, -8, 8),
    seed,
    proofUpdatedAt:
      updatedAt > 0n
        ? new Date(Number(updatedAt) * 1_000).toISOString()
        : null,
    dataOrigin: "live" as const,
  } satisfies NftDetailDto;
}

export async function liveNftGarden(params: {
  chainId: number;
  collection: string;
  tokenId: string;
}) {
  const nft = await readLiveNft(params);
  return summarize(
    params.collection,
    "collection",
    params.chainId,
    [nft],
  );
}

export async function liveWalletGarden(
  address: string,
  chainId: number,
) {
  if (!isAddress(address)) {
    throw new LiveDataError("Wallet must be a valid 0x address.", 400);
  }
  const apiKey = blockvisionKey(chainId);
  if (!apiKey) {
    throw new LiveDataError(
      "Live wallet indexing needs BLOCKVISION_MAINNET_API_KEY or BLOCKVISION_TESTNET_API_KEY.",
      503,
    );
  }

  const url = new URL(
    "https://api.blockvision.org/v2/monad/account/nfts",
  );
  url.searchParams.set("address", address);
  url.searchParams.set("pageIndex", "1");
  url.searchParams.set("verified", "false");
  url.searchParams.set("unknown", "true");

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "x-api-key": apiKey,
    },
  });
  if (!response.ok) {
    throw new LiveDataError(
      `BlockVision returned HTTP ${response.status}.`,
      502,
    );
  }
  const payload =
    (await response.json()) as BlockVisionWalletResponse;
  if (payload.code !== undefined && payload.code !== 0) {
    throw new LiveDataError(
      payload.message || payload.reason || "BlockVision request failed.",
      502,
    );
  }

  const indexed = (payload.result?.data || [])
    .filter(
      (collection) =>
        !collection.ercStandard ||
        collection.ercStandard.toUpperCase() === "ERC721",
    )
    .flatMap((collection) => collection.items || [])
    .filter(
      (item) =>
        isAddress(item.contractAddress) && /^\d+$/.test(item.tokenId),
    )
    .slice(0, 20);

  const settled = await Promise.allSettled(
    indexed.map((item) =>
      readLiveNft({
        chainId,
        collection: item.contractAddress,
        tokenId: item.tokenId,
        indexedName: item.name,
        indexedImage: item.image,
      }),
    ),
  );
  const nfts = settled.flatMap((result) =>
    result.status === "fulfilled" ? [result.value] : [],
  );

  return summarize(address, "wallet", chainId, nfts);
}
