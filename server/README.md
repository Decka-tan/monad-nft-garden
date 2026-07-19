# @monad-nft-garden/server

Backend API for **Monad NFT Garden** sandbox.

Tagline: *Is Monad NFT really dead? We make these alive with this Sandbox.*

## Stack

- **Hono** + Node 22
- **Zod** validation
- **PostgreSQL** + **Drizzle** (schema ready; optional for MOCK_MODE)
- **Redis** / BullMQ (compose ready; jobs stubbed in-process for MVP)
- **viem** reserved for live RPC adapters

See `/docs/BACKEND_STACK.md` for full architecture.

## Quick start (mock, no DB required)

```bash
cd server
cp .env.example .env
npm install
npm run dev
```

API: `http://127.0.0.1:8787`

### Smoke

```bash
curl -s http://127.0.0.1:8787/health | jq
curl -s http://127.0.0.1:8787/v1/meta/product | jq
curl -s http://127.0.0.1:8787/v1/garden/wallet/0x7d3A5a0F56f2E9fb000000000000000000000001 | jq '.portfolioScore,.counts'
curl -s http://127.0.0.1:8787/v1/nfts/10143/0xe7f129fac3a5eeca642af10f93adee8c969fdb03/3 | jq '.status,.floorNow,.creature'
```

## Optional infra

From repo root:

```bash
docker compose up -d postgres redis minio
```

Then set `MOCK_MODE=false` later when live adapters land.

## Routes

| Method | Path |
|--------|------|
| GET | `/health` |
| GET | `/v1/meta/chains` |
| GET | `/v1/meta/product` |
| GET | `/v1/garden/wallet/:address` |
| GET | `/v1/garden/collection/:address` |
| GET | `/v1/nfts/:chainId/:collection/:tokenId` |
| POST | `/v1/nfts/:chainId/:collection/:tokenId/analyze` |
| POST | `/v1/nfts/:chainId/:collection/:tokenId/creature` |
| GET | `/v1/nfts/:chainId/:collection/:tokenId/creature` |

Creature POST **queues generation only**; it never writes the passport contract (wallet does that from FE).
