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
    tagline:
      "Is Monad NFT really dead? " +
      "We make these alive with this Sandbox.",
    role: {
      frontend: "sandbox UI + wallet",
      backend:
        "stats, creature brain, sprite gen, cache",
      contract:
        "lightweight passport (score + cids)",
    },
    mockMode: config.mockMode,
  }),
);

metaRoutes.get("/meta/health-formula", (c) =>
  c.json({
    weights: {
      floorResilience: 0.4,
      recentTrades: 0.25,
      holderSpread: 0.2,
      rarityTraits: 0.15,
    },
    thresholds: {
      alive: 70,
      watch: 46,
      dead: 0,
    },
  }),
);
