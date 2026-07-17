import { Hono } from "hono";
import { z } from "zod";
import { config } from "../config.js";
import { mockNftDetail } from "../services/mockGarden.js";
import { creatureStore } from "../services/creatureStore.js";

export const nftRoutes = new Hono();

const paramsSchema = z.object({
  chainId: z.coerce.number().int().positive(),
  collection: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  tokenId: z.string().regex(/^\d+$/),
});

nftRoutes.get("/nfts/:chainId/:collection/:tokenId", (c) => {
  const parsed = paramsSchema.safeParse(c.req.param());
  if (!parsed.success) return c.json({ error: "invalid_params", details: parsed.error.flatten() }, 400);

  const { chainId, collection, tokenId } = parsed.data;
  const detail = mockNftDetail(chainId, collection.toLowerCase(), tokenId);
  if (!detail) {
    // still return deterministic card for any tokenId by re-seeding
    const fallback = mockNftDetail(chainId, collection.toLowerCase(), "1000");
    if (!fallback) return c.json({ error: "not_found" }, 404);
    const custom = {
      ...fallback,
      tokenId,
      name: `${fallback.name} #${tokenId}`,
      collection: collection.toLowerCase(),
    };
    const creature = creatureStore.get(chainId, collection, tokenId) || custom.creature;
    return c.json({ ...custom, creature });
  }

  const creature = creatureStore.get(chainId, collection, tokenId) || detail.creature;
  return c.json({ ...detail, creature });
});

nftRoutes.post("/nfts/:chainId/:collection/:tokenId/analyze", async (c) => {
  const parsed = paramsSchema.safeParse(c.req.param());
  if (!parsed.success) return c.json({ error: "invalid_params", details: parsed.error.flatten() }, 400);
  const { chainId, collection, tokenId } = parsed.data;

  // Rate-limit placeholder: mock always succeeds; live mode will queue BullMQ
  const detail = mockNftDetail(chainId, collection.toLowerCase(), tokenId) || {
    ...(mockNftDetail(chainId, collection.toLowerCase(), "1000") as NonNullable<ReturnType<typeof mockNftDetail>>),
    tokenId,
    collection: collection.toLowerCase(),
  };

  return c.json({
    ok: true,
    mode: config.mockMode ? "mock_refresh" : "queued",
    analyzedAt: new Date().toISOString(),
    nft: detail,
    note: config.mockMode
      ? "MOCK_MODE: analyze recomputed deterministically; no marketplace fetch"
      : "Job queued for stats refresh",
  });
});

nftRoutes.post("/nfts/:chainId/:collection/:tokenId/creature", async (c) => {
  const parsed = paramsSchema.safeParse(c.req.param());
  if (!parsed.success) return c.json({ error: "invalid_params", details: parsed.error.flatten() }, 400);
  const { chainId, collection, tokenId } = parsed.data;

  let body: { persona?: string; regenerate?: boolean } = {};
  try {
    body = await c.req.json();
  } catch {
    body = {};
  }

  const creature = creatureStore.queue(chainId, collection.toLowerCase(), tokenId, body.persona);
  return c.json({
    ok: true,
    inject: false,
    message: "Creature generation queued (no on-chain write). Worker stub runs in-process in MOCK_MODE.",
    creature,
  });
});

nftRoutes.get("/nfts/:chainId/:collection/:tokenId/creature", (c) => {
  const parsed = paramsSchema.safeParse(c.req.param());
  if (!parsed.success) return c.json({ error: "invalid_params", details: parsed.error.flatten() }, 400);
  const { chainId, collection, tokenId } = parsed.data;
  const creature = creatureStore.get(chainId, collection.toLowerCase(), tokenId);
  if (!creature) return c.json({ error: "not_found", status: "none" }, 404);
  return c.json({ creature });
});
