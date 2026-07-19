import { Contract, JsonRpcProvider } from "ethers";
import type { NftHealth } from "../types";
import {
  GARDEN_ABI,
  MONAD_NETWORKS,
  gardenContractAddressFor,
  getCheckInKey,
  type MonadNetworkKey,
} from "./config";
import {
  getBrowserProvider,
  isContractConfigured,
  switchToMonad,
} from "./wallet";

export async function readCheckIn(
  collection: string,
  nft: NftHealth,
  networkKey: MonadNetworkKey,
) {
  if (!isContractConfigured(networkKey)) {
    throw new Error(
      "Set VITE_GARDEN_CONTRACT_ADDRESS after deploy.",
    );
  }

  const provider = new JsonRpcProvider(
    MONAD_NETWORKS[networkKey].rpcUrls[0],
  );
  const contract = new Contract(
    gardenContractAddressFor(networkKey),
    GARDEN_ABI,
    provider,
  );
  const key = getCheckInKey(collection, nft.tokenId);
  const result = await contract.checkIns(key);
  const score = Number(result.healthScore || 0);
  const updatedAt = Number(result.updatedAt || 0);

  if (!updatedAt) {
    return "No on-chain check-in yet";
  }

  const when = new Date(
    updatedAt * 1000,
  ).toLocaleString();
  return `${score}/100 at ${when}`;
}

export async function writeCheckIn(params: {
  collection: string;
  nft: NftHealth;
  networkKey: MonadNetworkKey;
}) {
  if (!isContractConfigured(params.networkKey)) {
    throw new Error(
      "Set VITE_GARDEN_CONTRACT_ADDRESS after deploy.",
    );
  }

  await switchToMonad(params.networkKey);
  const provider = await getBrowserProvider();
  const signer = await provider.getSigner();
  const contract = new Contract(
    gardenContractAddressFor(params.networkKey),
    GARDEN_ABI,
    signer,
  );

  const spriteCid = "";
  const dataCid = params.nft.tokenUri || "";

  const tx = await contract.checkIn(
    params.collection,
    params.nft.tokenId,
    params.nft.score,
    spriteCid,
    dataCid,
  );
  await tx.wait();
  return tx.hash as string;
}

export async function connectAndLoadOwner(
  networkKey: MonadNetworkKey,
) {
  await switchToMonad(networkKey);
  const provider = await getBrowserProvider();
  const signer = await provider.getSigner();
  const network = await provider.getNetwork();
  const account = await signer.getAddress();

  let owner = "Deploy contract, then set address";
  if (isContractConfigured(networkKey)) {
    const contract = new Contract(
      gardenContractAddressFor(networkKey),
      GARDEN_ABI,
      provider,
    );
    owner = await contract.owner();
  }

  return {
    account,
    chainId: `0x${network.chainId.toString(16)}`,
    owner,
    status: `Connected to ${labelFor(networkKey)}`,
  };
}

function labelFor(key: MonadNetworkKey) {
  return key === "mainnet"
    ? "Monad Mainnet"
    : "Monad Testnet";
}
