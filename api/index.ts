import { handle } from "hono/vercel";
import { createApp } from "../server/dist/app.js";

/**
 * Vercel serverless entry.
 * Browser calls same-origin `/api/v1/...` → this function with basePath `/api`.
 */
export const config = {
  runtime: "nodejs",
  maxDuration: 30,
};

const app = createApp({ basePath: "/api" });

const handler = handle(app);

export const GET = handler;
export const POST = handler;
export const OPTIONS = handler;
