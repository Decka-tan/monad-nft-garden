import "dotenv/config";

export const config = {
  port: Number(process.env.PORT || 8787),
  host: process.env.HOST || "0.0.0.0",
  databaseUrl:
    process.env.DATABASE_URL ||
    "postgres://garden:garden@127.0.0.1:5432/nft_garden",
  redisUrl:
    process.env.REDIS_URL ||
    "redis://127.0.0.1:6379",
  defaultChainId: Number(
    process.env.DEFAULT_CHAIN_ID || 10143,
  ),
  mockMode:
    (process.env.MOCK_MODE || "false")
      .toLowerCase() !== "false",
  corsOrigin: process.env.CORS_ORIGIN || "*",
  blockvisionApiKey:
    process.env.BLOCKVISION_API_KEY || "",
  blockvisionMainnetApiKey:
    process.env.BLOCKVISION_MAINNET_API_KEY ||
    process.env.BLOCKVISION_API_KEY ||
    "",
  blockvisionTestnetApiKey:
    process.env.BLOCKVISION_TESTNET_API_KEY ||
    process.env.BLOCKVISION_API_KEY ||
    "",
  monadMainnetRpcUrl:
    process.env.MONAD_MAINNET_RPC_URL ||
    "https://rpc.monad.xyz",
  monadTestnetRpcUrl:
    process.env.MONAD_TESTNET_RPC_URL ||
    process.env.MONAD_RPC_URL ||
    "https://testnet-rpc.monad.xyz",
  passportMainnetAddress:
    process.env.GARDEN_MAINNET_CONTRACT_ADDRESS ||
    "0xc9FB1366ab996c3319bD33C8fc1bb4AAb6b56720",
  passportTestnetAddress:
    process.env.GARDEN_TESTNET_CONTRACT_ADDRESS ||
    "0x0000000000000000000000000000000000000000",
};
