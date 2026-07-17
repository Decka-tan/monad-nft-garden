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
        symbol: "MON",
        rpc: process.env.MONAD_TESTNET_RPC_URL || "https://testnet-rpc.monad.xyz",
        explorer: "https://testnet.monadvision.com",
      },
      {
        chainId: 143,
        name: "Monad Mainnet",
        symbol: "MON",
        rpc: process.env.MONAD_MAINNET_RPC_URL || "https://rpc.monad.xyz",
        explorer: "https://monadvision.com",
      },
    ],
  }),
);

metaRoutes.get("/meta/product", (c) =>
  c.json({
    name: "Monad NFT Garden",
    tagline: "Is Monad NFT really dead? We make these alive with this Sandbox.",
    role: "backend",
    features: [
      "wallet/collection sandbox analysis",
      "NFT health stats (minter, floors, holders, traits)",
      "creature brain + pixel sprite pipeline (async)",
      "passport contract CIDs optional",
    ],
  }),
);
