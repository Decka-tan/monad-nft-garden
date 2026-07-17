import { Hono } from "hono";
import { z } from "zod";
import { config } from "../config.js";
import { mockGarden } from "../services/mockGarden.js";

export const gardenRoutes = new Hono();

const addressParam = z.string().min(3).max(128);

gardenRoutes.get("/garden/wallet/:address", (c) => {
  const address = addressParam.parse(c.req.param("address"));
  const chainId = Number(c.req.query("chainId") || config.defaultChainId);
  // MVP: mock adapter (live indexer later)
  const body = mockGarden("wallet", address, chainId);
  return c.json(body);
});

gardenRoutes.get("/garden/collection/:address", (c) => {
  const address = addressParam.parse(c.req.param("address"));
  const chainId = Number(c.req.query("chainId") || config.defaultChainId);
  const body = mockGarden("collection", address, chainId);
  return c.json(body);
});
