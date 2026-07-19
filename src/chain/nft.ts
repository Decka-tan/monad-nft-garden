import { Contract, JsonRpcProvider } from "ethers";
import {
  MONAD_NETWORKS,
  type MonadNetworkKey,
} from "./config";

const ERC721_READ_ABI = [
  "function name() view returns (string)",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function tokenURI(uint256 tokenId) view returns (string)",
];

export type OnchainNftRead = {
  collection: string;
  tokenId: string;
  collectionName: string;
  owner: string;
  tokenUri: string;
  nftName: string;
  imageUrl: string;
};

function publicUrl(uri: string) {
  if (uri.startsWith("ipfs://")) {
    return `https://ipfs.io/ipfs/${uri.slice(7)}`;
  }
  return uri;
}

function parseDataJson(uri: string) {
  const comma = uri.indexOf(",");
  if (comma < 0) return null;
  const header = uri.slice(0, comma);
  const payload = uri.slice(comma + 1);
  const json = header.includes(";base64")
    ? atob(payload)
    : decodeURIComponent(payload);
  return JSON.parse(json) as {
    name?: string;
    image?: string;
  };
}

async function readMetadata(uri: string) {
  if (!uri) return null;
  if (uri.startsWith("data:application/json")) {
    return parseDataJson(uri);
  }

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(publicUrl(uri), {
      signal: controller.signal,
    });
    if (!response.ok) return null;
    return (await response.json()) as {
      name?: string;
      image?: string;
    };
  } catch {
    return null;
  } finally {
    window.clearTimeout(timeout);
  }
}

export async function readNftContract(
  collection: string,
  tokenId: string | number,
  networkKey: MonadNetworkKey,
): Promise<OnchainNftRead> {
  const provider = new JsonRpcProvider(
    MONAD_NETWORKS[networkKey].rpcUrls[0],
  );
  const code = await provider.getCode(collection);
  if (code === "0x") {
    throw new Error("No NFT contract exists at this address.");
  }

  const contract = new Contract(
    collection,
    ERC721_READ_ABI,
    provider,
  );
  const [nameResult, ownerResult, uriResult] =
    await Promise.allSettled([
      contract.name() as Promise<string>,
      contract.ownerOf(tokenId) as Promise<string>,
      contract.tokenURI(tokenId) as Promise<string>,
    ]);

  if (ownerResult.status === "rejected") {
    throw new Error(
      "This token was not found or the contract is not ERC-721.",
    );
  }

  const tokenUri =
    uriResult.status === "fulfilled" ? uriResult.value : "";
  const metadata = await readMetadata(tokenUri);

  return {
    collection,
    tokenId: String(tokenId),
    collectionName:
      nameResult.status === "fulfilled"
        ? nameResult.value
        : "ERC-721 collection",
    owner: ownerResult.value,
    tokenUri,
    nftName: metadata?.name || `Token #${tokenId}`,
    imageUrl: metadata?.image
      ? publicUrl(metadata.image)
      : "",
  };
}
