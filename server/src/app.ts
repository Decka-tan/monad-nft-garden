import { Hono } from "hono";
import { cors } from "hono/cors";
import { config } from "./config.js";
import { gardenRoutes } from "./routes/garden.js";
import { nftRoutes } from "./routes/nfts.js";
import { metaRoutes } from "./routes/meta.js";

export function createApp(options?: { basePath?: string }) {
  const app = new Hono().basePath(options?.basePath ?? "");

  app.use(
    "*",
    cors({
      origin: config.corsOrigin === "*" ? "*" : config.corsOrigin.split(","),
      allowMethods: ["GET", "POST", "OPTIONS"],
      allowHeaders: ["Content-Type", "Authorization"],
    }),
  );

  app.get("/health", (c) =>
    c.json({
      ok: true,
      service: "monad-nft-garden-api",
      mockMode: config.mockMode,
      defaultChainId: config.defaultChainId,
      tagline: "Is Monad NFT really dead? We make these alive with this Sandbox.",
    }),
  );

  app.route("/v1", metaRoutes);
  app.route("/v1", gardenRoutes);
  app.route("/v1", nftRoutes);

  app.notFound((c) => c.json({ error: "not_found", path: c.req.path }, 404));
  app.onError((err, c) => {
    console.error(err);
    return c.json({ error: "internal_error", message: err.message }, 500);
  });

  return app;
}
