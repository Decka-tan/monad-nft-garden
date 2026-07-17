import { BrowserProvider, ethers } from "ethers";
import {
  GARDEN_CONTRACT_ADDRESS,
  MONAD_NETWORKS,
  type MonadNetworkKey,
} from "./config";
import { ZERO_ADDRESS } from "../constants";

export function isContractConfigured() {
  return (
    ethers.isAddress(GARDEN_CONTRACT_ADDRESS) &&
    GARDEN_CONTRACT_ADDRESS !== ZERO_ADDRESS
  );
}

export async function getBrowserProvider() {
  if (!window.ethereum) {
    throw new Error(
      "No wallet found. Install MetaMask or similar.",
    );
  }
  return new BrowserProvider(
    window.ethereum as ethers.Eip1193Provider,
  );
}

export async function switchToMonad(
  networkKey: MonadNetworkKey,
) {
  if (!window.ethereum) {
    throw new Error("No wallet found.");
  }

  const network = MONAD_NETWORKS[networkKey];

  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: network.chainId }],
    });
  } catch (error) {
    const code =
      typeof error === "object" &&
      error &&
      "code" in error
        ? (error as { code?: number }).code
        : undefined;

    if (code !== 4902) throw error;

    await window.ethereum.request({
      method: "wallet_addEthereumChain",
      params: [network],
    });
  }
}
