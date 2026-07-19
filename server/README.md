# @monad-nft-garden/server

Backend API for **Monad NFT Garden**.

Tagline: *Verify the NFT. Care for it. Leave an on-chain record.*

## Stack

- **Hono** + Node 22
- **Zod** validation
- **viem** for live Monad RPC reads
- **BlockVision** adapter for optional wallet-wide discovery

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
curl -s 'http://127.0.0.1:8787/v1/garden/nft/0x837DC8f746608Ea3021930d59d58DDCa9B658f3E/1?chainId=143' | jq '.source,.nfts[0].owner,.nfts[0].score'
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
