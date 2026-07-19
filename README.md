# Monad NFT Garden

A Proof of Care dApp for Monad NFTs. It verifies ownership and metadata, turns care freshness into a living garden state, and lets the token owner preserve a check-in on-chain.

**Pitch:** *Verify the NFT. Care for it. Leave an on-chain record.*

## Problem

NFT wallets show what someone owns, but they do not give collectors a simple ritual for revisiting an NFT or preserving that interaction. A token becomes another static row in a gallery.

## Solution

NFT Garden reads a real ERC-721 directly from Monad, verifies its current owner and metadata, then derives a living state from its latest Proof of Care. The owner can refresh that state with a transaction; anyone can verify the record.

## Monad deployment

- Network: Monad Mainnet (`143`)
- `NFTGardenPassport`: [`0xc9FB1366ab996c3319bD33C8fc1bb4AAb6b56720`](https://monadscan.com/address/0xc9FB1366ab996c3319bD33C8fc1bb4AAb6b56720)
- Live specimen, `GardenSeed #1`: [`0x837DC8f746608Ea3021930d59d58DDCa9B658f3E`](https://monadscan.com/address/0x837DC8f746608Ea3021930d59d58DDCa9B658f3E)
- Initial Proof of Care: [`0x089c1f...2351`](https://monadscan.com/tx/0x089c1fedbd71adb0dd884e648805ff56d93fb8b2b3f704362322cb6c3dc02351)

## Stack

| Layer | Tech |
|-------|------|
| Frontend | React 19 + Vite + ethers |
| Backend API | Hono + Zod + BlockVision adapter (TypeScript) |
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

The default specimen and every single-NFT search are live through Monad RPC and need no provider key. Wallet-wide discovery uses the BlockVision account-NFT API and requires an API key.

## Deploy on Vercel

1. Push this repo to GitHub.
2. [vercel.com/new](https://vercel.com/new) -> import the repo.
3. Framework: **Vite** (auto from `vercel.json`).
4. Env vars (optional):

| Name | Value | Notes |
|------|--------|------|
| `MOCK_MODE` | `false` | Keep live routes explicit; demo has its own route |
| `DEFAULT_CHAIN_ID` | `143` | Monad mainnet |
| `CORS_ORIGIN` | `*` | Or your production domain |
| `VITE_GARDEN_TESTNET_CONTRACT_ADDRESS` | `0x...` | Optional testnet passport |
| `VITE_GARDEN_MAINNET_CONTRACT_ADDRESS` | `0xc9FB...6720` | Deployed mainnet passport |
| `BLOCKVISION_MAINNET_API_KEY` | `...` | Live mainnet wallet NFT discovery |
| `BLOCKVISION_TESTNET_API_KEY` | `...` | Live testnet wallet NFT discovery |
| `VITE_GARDEN_API_URL` | *(leave empty)* | Same-origin `/api` on Vercel |

5. Deploy. Open the URL -> enter the live garden -> inspect Garden Seed #1 -> verify the ERC-721 read -> record **Proof of Care** from its owner wallet.

CLI:

```bash
npx vercel
```

## What works today

- Pre-connect product landing and an instant live mainnet specimen
- Onchain `GardenSeed #1` with standards-compatible ownership and metadata
- Live ERC-721 `ownerOf`, `name`, and `tokenURI` reads from Monad RPC
- Optional live wallet NFT discovery through BlockVision
- Care state derived from the latest on-chain Proof of Care timestamp
- Token-owner-only Proof of Care contract write and public record read
- Explicit deterministic demo API kept separate from all live routes

The default product path and live search never substitute placeholder values after a provider or RPC failure.

## API routes

| Method | Path |
|--------|------|
| GET | `/api/health` (prod) or `/health` (local API) |
| GET | `/api/v1/garden/wallet/:address` |
| GET | `/api/v1/garden/nft/:collection/:tokenId` |
| GET | `/api/v1/garden/demo/:collection` |
| GET | `/api/v1/meta/product` |

## Contract (Hardhat)

```bash
cp .env.example .env
# set PRIVATE_KEY + RPC
npm run compile
npm run deploy:monad:mainnet
# optional owned specimen for an end-to-end demo
npm run deploy:seed:mainnet
```

Then set `VITE_GARDEN_CONTRACT_ADDRESS` and redeploy FE.

- Mainnet chain ID `143` - `https://rpc.monad.xyz`
- Testnet chain ID `10143` - `https://testnet-rpc.monad.xyz`

## Repo layout

```text
src/           React sandbox UI
server/        Hono API (local + source for Vercel)
api/           Vercel serverless entry -> Hono
contracts/     NFTGardenPassport.sol + GardenSeed.sol
docs/          Architecture
```

## Credits

Frontend prototype inspired by [Decka-tan/monad-nft-garden](https://github.com/Decka-tan/monad-nft-garden). Backend + Vercel wiring for the living sandbox product.
