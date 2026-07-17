import { Hono } from "hono";
import { z } from "zod";
import { config } from "../config.js";
import { mockGarden } from "../garden/mock.js";

export const gardenRoutes = new Hono();

const addressParam = z.string().min(3).max(128);

function chainFrom(c: {
  req: { query: (k: string) => string | undefined };
}) {
  return Number(
    c.req.query("chainId") || config.defaultChainId,
  );
}

gardenRoutes.get("/garden/wallet/:address", (c) => {
  const address = addressParam.parse(
    c.req.param("address"),
  );
  const body = mockGarden(
    "wallet",
    address,
    chainFrom(c),
  );
  return c.json(body);
});

gardenRoutes.get("/garden/collection/:address", (c) => {
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
