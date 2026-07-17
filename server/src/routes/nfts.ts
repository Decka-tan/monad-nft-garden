import { Hono } from "hono";
import { z } from "zod";
import { config } from "../config.js";
import { mockNftDetail } from "../garden/mock.js";
import { creatureStore } from "../services/creatureStore.js";

export const nftRoutes = new Hono();

const paramsSchema = z.object({
  chainId: z.coerce.number().int().positive(),
  collection: z
    .string()
    .regex(/^0x[a-fA-F0-9]{40}$/),
  tokenId: z.string().regex(/^\d+$/),
});

function parseParams(raw: Record<string, string>) {
  return paramsSchema.safeParse(raw);
}

function detailOrFallback(
  chainId: number,
  collection: string,
  tokenId: string,
) {
  const col = collection.toLowerCase();
  const found = mockNftDetail(chainId, col, tokenId);
  if (found) return found;

  const base = mockNftDetail(chainId, col, "1000");
  if (!base) return null;

  return {
    ...base,
    tokenId,
    name: `${base.name} #${tokenId}`,
    collection: col,
  };
}

nftRoutes.get(
  "/nfts/:chainId/:collection/:tokenId",
  (c) => {
    const parsed = parseParams(c.req.param());
    if (!parsed.success) {
      return c.json(
        {
          error: "invalid_params",
          details: parsed.error.flatten(),
        },
        400,
      );
    }

    const { chainId, collection, tokenId } = parsed.data;
    const detail = detailOrFallback(
      chainId,
      collection,
      tokenId,
    );
    if (!detail) {
      return c.json({ error: "not_found" }, 404);
    }

    const creature =
      creatureStore.get(chainId, collection, tokenId) ||
      detail.creature;

    return c.json({ ...detail, creature });
  },
);

nftRoutes.post(
  "/nfts/:chainId/:collection/:tokenId/analyze",
  async (c) => {
    const parsed = parseParams(c.req.param());
    if (!parsed.success) {
      return c.json(
        {
          error: "invalid_params",
          details: parsed.error.flatten(),
        },
        400,
      );
    }

    const { chainId, collection, tokenId } = parsed.data;
    const detail = detailOrFallback(
      chainId,
      collection,
      tokenId,
    );

    return c.json({
      ok: true,
      mode: config.mockMode ? "mock_refresh" : "queued",
      analyzedAt: new Date().toISOString(),
      nft: detail,
      note: config.mockMode
        ? "MOCK_MODE: analyze is deterministic, no market fetch"
        : "Job queued for stats refresh",
    });
  },
);

nftRoutes.post(
  "/nfts/:chainId/:collection/:tokenId/creature",
  async (c) => {
    const parsed = parseParams(c.req.param());
    if (!parsed.success) {
      return c.json(
        {
          error: "invalid_params",
          details: parsed.error.flatten(),
        },
        400,
      );
    }

    const { chainId, collection, tokenId } = parsed.data;

    let body: {
      persona?: string;
      regenerate?: boolean;
    } = {};
    try {
      body = await c.req.json();
    } catch {
      body = {};
    }

    const creature = creatureStore.queue(
      chainId,
      collection.toLowerCase(),
      tokenId,
      body.persona,
    );

    return c.json({
      ok: true,
      inject: false,
      message:
        "Creature queued. No on-chain write. " +
        "Mock worker finishes in-process.",
      creature,
    });
  },
);

nftRoutes.get(
  "/nfts/:chainId/:collection/:tokenId/creature",
  (c) => {
    const parsed = parseParams(c.req.param());
    if (!parsed.success) {
      return c.json(
        {
          error: "invalid_params",
          details: parsed.error.flatten(),
        },
        400,
      );
    }

    const { chainId, collection, tokenId } = parsed.data;
    const creature = creatureStore.get(
      chainId,
      collection.toLowerCase(),
      tokenId,
    );

    if (!creature) {
      return c.json(
        { error: "not_found", status: "none" },
        404,
      );
    }

    return c.json({ creature });
  },
);
