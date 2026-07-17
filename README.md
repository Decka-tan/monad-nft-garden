# Monad NFT Garden

A living NFT portfolio health sandbox for Monad. Each NFT becomes a creature whose mood reflects floor resilience, trade recency, holder spread, and rarity signals.

**Tagline:** *Is Monad NFT really dead? We make these alive with this Sandbox.*

## Stack

| Layer | Tech |
|-------|------|
| Frontend | React 19 + Vite + ethers |
| Backend API | Hono + Zod (TypeScript) |
| DB (optional) | PostgreSQL + Drizzle |
| Cache/jobs (optional) | Redis + BullMQ |
| Chain | Monad testnet/mainnet + `NFTGardenPassport` |
| Deploy | **Vercel** (static FE + serverless `/api`) |

Full backend design: [`docs/BACKEND_STACK.md`](./docs/BACKEND_STACK.md)

## Quick start (local)

### 1) API

```bash
cd server
cp .env.example .env
npm install
npm run dev
```

API: `http://127.0.0.1:8787`

### 2) Web

```bash
# repo root
npm install
cp .env.example .env   # optional
npm run dev
```

Web: `http://127.0.0.1:3010`  
Vite proxies `/api/*` → API `:8787`.

Or two terminals:

```bash
npm run dev:api
npm run dev:web
```

### Optional infra

```bash
npm run infra:up   # postgres + redis + minio
```

`MOCK_MODE=true` (default) needs **no** database — deterministic garden data for demos.

## Deploy on Vercel

1. Push this repo to GitHub.
2. [vercel.com/new](https://vercel.com/new) → import the repo.
3. Framework: **Vite** (auto from `vercel.json`).
4. Env vars (optional):

| Name | Value | Notes |
|------|--------|------|
| `MOCK_MODE` | `true` | Default; works without DB |
| `DEFAULT_CHAIN_ID` | `10143` | Monad testnet |
| `CORS_ORIGIN` | `*` | Or your production domain |
| `VITE_GARDEN_CONTRACT_ADDRESS` | `0x…` | After contract deploy |
| `VITE_GARDEN_API_URL` | *(leave empty)* | Same-origin `/api` on Vercel |

5. Deploy. Open the URL → Analyze wallet → click NFT → stats + **Awaken creature**.

CLI:

```bash
npx vercel
```

## What works today

- Wallet / collection analyze via **Garden API** (mock deterministic health)
- 20-NFT sandbox grid + filters (alive / watch / dead)
- Detail modal: minter, floor ATH/now, holders, traits, rarity, score reasons
- **Awaken creature** → API queue (no on-chain inject)
- Wallet connect + Monad network switch
- Passport contract read/write when `VITE_GARDEN_CONTRACT_ADDRESS` set
- Local mock fallback if API is down

## API routes

| Method | Path |
|--------|------|
| GET | `/api/health` (prod) or `/health` (local API) |
| GET | `/api/v1/garden/wallet/:address` |
| GET | `/api/v1/garden/collection/:address` |
| GET | `/api/v1/nfts/:chainId/:collection/:tokenId` |
| POST | `/api/v1/nfts/.../analyze` |
| POST | `/api/v1/nfts/.../creature` |
| GET | `/api/v1/meta/product` |

## Contract (Hardhat)

```bash
cp .env.example .env
# set PRIVATE_KEY + RPC
npm run compile
npm run deploy:monad
```

Then set `VITE_GARDEN_CONTRACT_ADDRESS` and redeploy FE.

- Mainnet chain ID `143` — `https://rpc.monad.xyz`
- Testnet chain ID `10143` — `https://testnet-rpc.monad.xyz`

## Repo layout

```text
src/           React sandbox UI
server/        Hono API (local + source for Vercel)
api/           Vercel serverless entry → Hono
contracts/     NFTGardenPassport.sol
docs/          Architecture
```

## Credits

Frontend prototype inspired by [Decka-tan/monad-nft-garden](https://github.com/Decka-tan/monad-nft-garden). Backend + Vercel wiring for the living sandbox product.
