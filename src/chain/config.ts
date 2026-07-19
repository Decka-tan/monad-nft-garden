import { ethers } from "ethers";

const testnetRpc =
  import.meta.env.VITE_MONAD_TESTNET_RPC_URL ||
  import.meta.env.VITE_MONAD_RPC_URL ||
  "https://testnet-rpc.monad.xyz";

const mainnetRpc =
  import.meta.env.VITE_MONAD_MAINNET_RPC_URL ||
  "https://rpc.monad.xyz";

export const MONAD_NETWORKS = {
  testnet: {
    chainId: "0x279f",
    chainName: "Monad Testnet",
    nativeCurrency: {
      name: "Monad",
      symbol: "MON",
      decimals: 18,
    },
    rpcUrls: [testnetRpc, "https://rpc.testnet.monad.xyz"],
    blockExplorerUrls: [
      "https://testnet.monadscan.com",
    ],
  },
  mainnet: {
    chainId: "0x8f",
    chainName: "Monad Mainnet",
    nativeCurrency: {
      name: "Monad",
      symbol: "MON",
      decimals: 18,
    },
    rpcUrls: [mainnetRpc],
    blockExplorerUrls: ["https://monadvision.com"],
  },
} as const;

export type MonadNetworkKey = keyof typeof MONAD_NETWORKS;

const zeroAddress =
  "0x0000000000000000000000000000000000000000";
const legacyContractAddress =
  import.meta.env.VITE_GARDEN_CONTRACT_ADDRESS;

export const GARDEN_CONTRACT_ADDRESSES = {
  testnet:
    import.meta.env.VITE_GARDEN_TESTNET_CONTRACT_ADDRESS ||
    legacyContractAddress ||
    zeroAddress,
  mainnet:
    import.meta.env.VITE_GARDEN_MAINNET_CONTRACT_ADDRESS ||
    "0xc9FB1366ab996c3319bD33C8fc1bb4AAb6b56720",
} as const;

export function gardenContractAddressFor(
  networkKey: MonadNetworkKey,
) {
  return GARDEN_CONTRACT_ADDRESSES[networkKey];
}

export const GARDEN_ABI = [
  "function owner() view returns (address)",
  "function checkIns(bytes32) view returns (uint64 updatedAt, uint16 healthScore, string spriteCid, string dataCid)",
  "function checkIn(address collection, uint256 tokenId, uint16 healthScore, string spriteCid, string dataCid)",
  "function transferOwnership(address nextOwner)",
  "event GardenCheckedIn(address indexed collection, uint256 indexed tokenId, uint16 healthScore, string spriteCid, string dataCid)",
];

export function getCheckInKey(
  collection: string,
  tokenId: number | bigint,
) {
  return ethers.keccak256(
    ethers.AbiCoder.defaultAbiCoder().encode(
      ["address", "uint256"],
      [collection, BigInt(tokenId)],
    ),
  );
}

export function chainIdFor(
  networkKey: MonadNetworkKey,
): number {
  return networkKey === "mainnet" ? 143 : 10143;
}
