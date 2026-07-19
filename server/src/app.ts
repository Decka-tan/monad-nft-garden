import { Hono } from "hono";
import { cors } from "hono/cors";
import { config } from "./config.js";
import { gardenRoutes } from "./routes/garden.js";
import { metaRoutes } from "./routes/meta.js";

export type AppOptions = {
  basePath?: string;
};

export function createApp(opts: AppOptions = {}) {
  const app = opts.basePath
    ? new Hono().basePath(opts.basePath)
    : new Hono();

  app.use(
    "*",
    cors({
      origin: config.corsOrigin,
      allowMethods: [
        "GET",
        "POST",
        "OPTIONS",
      ],
      allowHeaders: [
        "Content-Type",
        "Accept",
      ],
    }),
  );

  app.get("/health", (c) =>
    c.json({
      ok: true,
      service: "monad-nft-garden-api",
      mockMode: config.mockMode,
      defaultChainId: config.defaultChainId,
      tagline: "Verify the NFT. Care for it. Leave an on-chain record.",
    }),
  );

  app.route("/v1", gardenRoutes);
  app.route("/v1", metaRoutes);

  app.notFound((c) =>
    c.json({ error: "not_found" }, 404),
  );

  app.onError((err, c) => {
    console.error("[garden-api]", err);
    return c.json(
      {
        error: "internal_error",
        message: err.message,
      },
      500,
    );
  });

  return app;
}
