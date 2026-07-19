require("dotenv/config");
require("@nomicfoundation/hardhat-toolbox");

const privateKey = process.env.PRIVATE_KEY;
const emptyKey =
  "0x0000000000000000000000000000000000000000000000000000000000000000";
const accounts =
  privateKey && privateKey !== emptyKey ? [privateKey] : [];

/** @type {import("hardhat/config").HardhatUserConfig} */
module.exports = {
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
      url:
        process.env.MONAD_TESTNET_RPC_URL ||
        process.env.MONAD_RPC_URL ||
        "https://testnet-rpc.monad.xyz",
      chainId: 10143,
      accounts,
    },
    monadMainnet: {
      url:
        process.env.MONAD_MAINNET_RPC_URL ||
        "https://rpc.monad.xyz",
      chainId: 143,
      accounts,
    },
  },
  etherscan: {
    apiKey: {
      monadTestnet:
        process.env.MONAD_EXPLORER_API_KEY || "empty",
      monadMainnet:
        process.env.MONAD_EXPLORER_API_KEY || "empty",
    },
    customChains: [
      {
        network: "monadMainnet",
        chainId: 143,
        urls: {
          apiURL:
            "https://api.etherscan.io/v2/api?chainid=143",
          browserURL: "https://monadscan.com",
        },
      },
      {
        network: "monadTestnet",
        chainId: 10143,
        urls: {
          apiURL:
            "https://api.etherscan.io/v2/api?chainid=10143",
          browserURL: "https://testnet.monadscan.com",
        },
      },
    ],
  },
};
