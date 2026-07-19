import { BrowserProvider, ethers } from "ethers";
import {
  MONAD_NETWORKS,
  gardenContractAddressFor,
  type MonadNetworkKey,
} from "./config";
import { ZERO_ADDRESS } from "../constants";

export function isContractConfigured(
  networkKey: MonadNetworkKey,
) {
  const contractAddress = gardenContractAddressFor(networkKey);
  return (
    ethers.isAddress(contractAddress) &&
    contractAddress !== ZERO_ADDRESS
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
