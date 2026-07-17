import { handle } from "hono/vercel";
import { createApp } from "../server/src/app";

/**
 * Vercel serverless entry.
 * Browser calls same-origin `/api/v1/...` → this function with basePath `/api`.
 */
export const config = {
  runtime: "nodejs",
  maxDuration: 30,
};

const app = createApp({ basePath: "/api" });

export default handle(app);
