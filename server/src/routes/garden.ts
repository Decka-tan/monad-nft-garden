import { Hono } from "hono";
import { z, ZodError } from "zod";
import { config } from "../config.js";
import { mockGarden } from "../garden/mock.js";
import {
  LiveDataError,
  liveNftGarden,
  liveWalletGarden,
} from "../services/liveGarden.js";

export const gardenRoutes = new Hono();

const addressParam = z
  .string()
  .regex(/^0x[a-fA-F0-9]{40}$/);
const tokenParam = z.string().regex(/^\d+$/);

function chainFrom(c: {
  req: { query: (k: string) => string | undefined };
}) {
  return Number(
    c.req.query("chainId") || config.defaultChainId,
  );
}

function liveError(c: { json: Function }, error: unknown) {
  if (error instanceof ZodError) {
    return c.json(
      { error: "invalid_request", message: "Use a valid address and numeric token ID." },
      400,
    );
  }
  if (error instanceof LiveDataError) {
    return c.json(
      { error: "live_data_unavailable", message: error.message },
      error.status,
    );
  }
  throw error;
}

gardenRoutes.get("/garden/demo/:address", (c) => {
  const address = addressParam.parse(
    c.req.param("address"),
  );
  const body = mockGarden(
    "collection",
    address,
    chainFrom(c),
  );
  return c.json(body);
});

gardenRoutes.get("/garden/wallet/:address", async (c) => {
  try {
    const address = addressParam.parse(c.req.param("address"));
    return c.json(await liveWalletGarden(address, chainFrom(c)));
  } catch (error) {
    return liveError(c, error);
  }
});

gardenRoutes.get(
  "/garden/nft/:collection/:tokenId",
  async (c) => {
    try {
      const collection = addressParam.parse(
        c.req.param("collection"),
      );
      const tokenId = tokenParam.parse(c.req.param("tokenId"));
      return c.json(
        await liveNftGarden({
          collection,
          tokenId,
          chainId: chainFrom(c),
        }),
      );
    } catch (error) {
      return liveError(c, error);
    }
  },
);
