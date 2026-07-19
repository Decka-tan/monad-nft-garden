import { Hono } from "hono";
import { config } from "../config.js";

export const metaRoutes = new Hono();

metaRoutes.get("/meta/chains", (c) =>
  c.json({
    defaultChainId: config.defaultChainId,
    chains: [
      {
        chainId: 10143,
        name: "Monad Testnet",
        rpcEnv: "MONAD_TESTNET_RPC_URL",
      },
      {
        chainId: 143,
        name: "Monad Mainnet",
        rpcEnv: "MONAD_MAINNET_RPC_URL",
      },
    ],
  }),
);

metaRoutes.get("/meta/product", (c) =>
  c.json({
    name: "Monad NFT Garden",
    tagline: "Verify the NFT. Care for it. Leave an on-chain record.",
    problem:
      "NFTs become static rows in a wallet with no history of collector care.",
    solution:
      "Read ownership and metadata from Monad, then preserve owner-authorized care on-chain.",
    deployment: {
      chainId: 143,
      passport: "0xc9FB1366ab996c3319bD33C8fc1bb4AAb6b56720",
      specimen: "0x837DC8f746608Ea3021930d59d58DDCa9B658f3E",
    },
    dataSources: ["Monad RPC", "NFTGardenPassport", "BlockVision (optional)"],
  }),
);
