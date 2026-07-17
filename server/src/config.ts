export const config = {
  port: Number(process.env.PORT || 8787),
  host: process.env.HOST || "0.0.0.0",
  databaseUrl: process.env.DATABASE_URL || "postgres://garden:garden@127.0.0.1:5432/nft_garden",
  redisUrl: process.env.REDIS_URL || "redis://127.0.0.1:6379",
  defaultChainId: Number(process.env.DEFAULT_CHAIN_ID || 10143), // Monad testnet
  mockMode: (process.env.MOCK_MODE || "true").toLowerCase() !== "false",
  corsOrigin: process.env.CORS_ORIGIN || "*",
  publicBaseUrl: process.env.PUBLIC_BASE_URL || "http://127.0.0.1:8787",
};
