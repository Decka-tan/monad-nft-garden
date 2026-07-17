import { serve } from "@hono/node-server";
import { createApp } from "./app.js";
import { config } from "./config.js";

const app = createApp();

serve({ fetch: app.fetch, port: config.port, hostname: config.host }, (info) => {
  console.log(`[garden-api] listening on http://${info.address}:${info.port}`);
  console.log(`[garden-api] mockMode=${config.mockMode} chainId=${config.defaultChainId}`);
});
