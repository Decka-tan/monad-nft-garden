import "dotenv/config";
import "@nomicfoundation/hardhat-toolbox";
import { HardhatUserConfig } from "hardhat/config";

const privateKey = process.env.PRIVATE_KEY;
const testnetRpcUrl = process.env.MONAD_TESTNET_RPC_URL || process.env.MONAD_RPC_URL || "https://testnet-rpc.monad.xyz";
const mainnetRpcUrl = process.env.MONAD_MAINNET_RPC_URL || "https://rpc.monad.xyz";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    monadTestnet: {
      url: testnetRpcUrl,
      chainId: 10143,
      accounts: privateKey && privateKey !== "0x0000000000000000000000000000000000000000000000000000000000000000"
        ? [privateKey]
        : [],
    },
    monadMainnet: {
      url: mainnetRpcUrl,
      chainId: 143,
      accounts: privateKey && privateKey !== "0x0000000000000000000000000000000000000000000000000000000000000000"
        ? [privateKey]
        : [],
    },
  },
  etherscan: {
    apiKey: {
      monadTestnet: process.env.MONAD_EXPLORER_API_KEY || "empty",
      monadMainnet: process.env.MONAD_EXPLORER_API_KEY || "empty",
    },
    customChains: [
      {
        network: "monadMainnet",
        chainId: 143,
        urls: {
          apiURL: "https://api.etherscan.io/v2/api?chainid=143",
          browserURL: "https://monadscan.com",
        },
      },
      {
        network: "monadTestnet",
        chainId: 10143,
        urls: {
          apiURL: "https://api.etherscan.io/v2/api?chainid=10143",
          browserURL: "https://testnet.monadscan.com",
        },
      },
    ],
  },
};

export default config;
