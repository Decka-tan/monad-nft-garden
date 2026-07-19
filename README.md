# Monad NFT Garden

A Proof of Care dApp for Monad NFTs. It translates market signals into a living garden, explains every health state, and lets the token owner preserve a care check-in on-chain.

**Pitch:** *See the signal. Care for the NFT. Leave an on-chain record.*

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
Vite proxies `/api/*` -> API `:8787`.

Or two terminals:

```bash
npm run dev:api
npm run dev:web
```

### Optional infra

```bash
npm run infra:up   # postgres + redis + minio
```

`MOCK_MODE=true` (default) needs **no** database - deterministic garden data for demos.

## Deploy on Vercel

1. Push this repo to GitHub.
2. [vercel.com/new](https://vercel.com/new) -> import the repo.
3. Framework: **Vite** (auto from `vercel.json`).
4. Env vars (optional):

| Name | Value | Notes |
|------|--------|------|
| `MOCK_MODE` | `true` | Default; works without DB |
| `DEFAULT_CHAIN_ID` | `10143` | Monad testnet |
| `CORS_ORIGIN` | `*` | Or your production domain |
| `VITE_GARDEN_CONTRACT_ADDRESS` | `0x...` | After contract deploy |
| `VITE_GARDEN_API_URL` | *(leave empty)* | Same-origin `/api` on Vercel |

5. Deploy. Open the URL -> enter the demo garden -> inspect an NFT -> verify the ERC-721 read -> record **Proof of Care**.

CLI:

```bash
npx vercel
```

## What works today

- Pre-connect product landing and instant demo garden
- 20-creature health garden with thriving / watch / dormant filters
- Explainable health model using floor resilience, trading pulse, holder spread, and rarity
- Direct ERC-721 `ownerOf`, `name`, and `tokenURI` reads from Monad
- Token-owner-only Proof of Care contract write and public record read
- Honest demo-mode disclosure plus local fallback when the API is down

The default market health values are deterministic demo data. ERC-721 and passport reads are separate on-chain operations and are labeled as such in the interface.

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

- Mainnet chain ID `143` - `https://rpc.monad.xyz`
- Testnet chain ID `10143` - `https://testnet-rpc.monad.xyz`

## Repo layout

```text
src/           React sandbox UI
server/        Hono API (local + source for Vercel)
api/           Vercel serverless entry -> Hono
contracts/     NFTGardenPassport.sol
docs/          Architecture
```

## Credits

Frontend prototype inspired by [Decka-tan/monad-nft-garden](https://github.com/Decka-tan/monad-nft-garden). Backend + Vercel wiring for the living sandbox product.
