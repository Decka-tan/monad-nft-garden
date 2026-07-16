/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GARDEN_CONTRACT_ADDRESS?: string;
  readonly VITE_MONAD_RPC_URL?: string;
  readonly VITE_MONAD_TESTNET_RPC_URL?: string;
  readonly VITE_MONAD_MAINNET_RPC_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface Window {
  ethereum?: import("ethers").Eip1193Provider;
}
