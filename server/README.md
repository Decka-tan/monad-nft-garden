# @monad-nft-garden/server

Backend API for **Monad NFT Garden** sandbox.

Tagline: *Is Monad NFT really dead? We make these alive with this Sandbox.*

## Stack

- **Hono** + Node 22
- **Zod** validation
- **PostgreSQL** + **Drizzle** (schema ready; optional for MOCK_MODE)
- **Redis** / BullMQ (compose ready; jobs stubbed in-process for MVP)
- **viem** for live Monad RPC reads

See `/docs/BACKEND_STACK.md` for full architecture.

## Quick start (no DB required)

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
curl -s 'http://127.0.0.1:8787/v1/garden/demo/0xe7f129fac3a5eeca642af10f93adee8c969fdb03?chainId=10143' | jq '.source,.counts'
curl -s 'http://127.0.0.1:8787/v1/garden/nft/0xe7f129fac3a5eeca642af10f93adee8c969fdb03/3?chainId=10143' | jq '.source,.nfts[0].owner'
curl -s http://127.0.0.1:8787/v1/nfts/10143/0xe7f129fac3a5eeca642af10f93adee8c969fdb03/3 | jq '.status,.floorNow,.creature'
```

## Optional infra

From repo root:

```bash
docker compose up -d postgres redis minio
```

Single-NFT reads are live through Monad RPC. Wallet discovery uses BlockVision when `BLOCKVISION_MAINNET_API_KEY` or `BLOCKVISION_TESTNET_API_KEY` is configured. The demo route remains deterministic and is always labeled as demo data.

## Routes

| Method | Path |
|--------|------|
| GET | `/health` |
| GET | `/v1/meta/chains` |
| GET | `/v1/meta/product` |
| GET | `/v1/garden/wallet/:address` |
| GET | `/v1/garden/nft/:collection/:tokenId` |
| GET | `/v1/garden/demo/:collection` |
| GET | `/v1/nfts/:chainId/:collection/:tokenId` |
| POST | `/v1/nfts/:chainId/:collection/:tokenId/analyze` |
| POST | `/v1/nfts/:chainId/:collection/:tokenId/creature` |
| GET | `/v1/nfts/:chainId/:collection/:tokenId/creature` |

Creature POST **queues generation only**; it never writes the passport contract (wallet does that from FE).
