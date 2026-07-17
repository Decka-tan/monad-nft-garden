# Backend stack decision — Monad NFT Garden

**Product:** living NFT sandbox on Monad  
**Tagline:** *Is Monad NFT really dead? We make these alive with this Sandbox.*  
**Our role:** backend (API, data, jobs, generation pipeline). Frontend stays React/Vite.

---

## Chosen stack

| Layer | Choice | Why |
|-------|--------|-----|
| **Language** | **TypeScript** | Same as existing FE + Hardhat; one language across monorepo |
| **API runtime** | **Node 22 + Hono** | Fast, typed, tiny surface; easy OpenAPI later |
| **Validation** | **Zod** | Shared request/response schemas with FE later |
| **DB** | **PostgreSQL 16** | Relational stats + **JSONB** traits/metadata; solid caching of floors/holders |
| **ORM** | **Drizzle** | Lightweight SQL-first, great migrations, no heavy Prisma client |
| **Cache / rate limit** | **Redis 7** | Hot wallet lookups, floor snapshots, job locks |
| **Jobs** | **BullMQ** (on Redis) | Sprite generation + stats refresh are async & retryable |
| **Chain client** | **viem** (backend) | Clean typed RPC; FE keeps **ethers** for wallet UX |
| **Object storage** | **S3-compatible (Cloudflare R2 / MinIO local)** | Generated pixel sprites; optional IPFS pin for on-chain `spriteCid` |
| **Image gen** | **Provider adapter** (OpenAI Images / Replicate / mock) | Swap without rewriting API |
| **Indexer** | **Adapter interface** | Monad RPC + explorer/market HTTP; mock for offline demos |
| **Auth** | **Optional SIWE** later; public read for sandbox | MVP = no login for analyze; write check-in stays wallet/contract |
| **Deploy local** | **Docker Compose** (api + postgres + redis + minio) | One command for team |
| **Deploy prod** | Railway / Fly / VPS + managed PG/Redis | Simple |

### Explicitly *not* chosen (and why)

| Rejected | Reason |
|----------|--------|
| Next.js API routes only | Mixing UI deploy with heavy jobs/gen is painful |
| MongoDB alone | Stats + joins + time series floors fit SQL better |
| Prisma | Fine product, but heavier; Drizzle is enough here |
| NestJS | Overkill for MVP sandbox API |
| Pure on-chain storage of all stats | Gas + latency; passport contract already holds CIDs + score only |

---

## System map

```text
┌──────────────┐     REST/JSON      ┌─────────────────┐
│  Vite React  │ ─────────────────► │  Hono API       │
│  sandbox UI  │ ◄───────────────── │  /v1/*          │
└──────────────┘                    └────────┬────────┘
                                             │
                    ┌────────────────────────┼────────────────────────┐
                    ▼                        ▼                        ▼
             PostgreSQL                 Redis                    S3 / R2 / MinIO
             (nfts, stats,              (cache,                  (sprite PNG)
              creatures, jobs meta)      BullMQ)
                                             │
                                             ▼
                                      Worker process
                                      - refresh stats
                                      - generate pixel creature
                                      - optional IPFS pin
                                             │
                    ┌────────────────────────┼────────────────────────┐
                    ▼                        ▼                        ▼
              Monad RPC                 Market/Explorer            Image provider
              (ownership,               (floor, volume,            (GPT-image /
               tokenURI)                 holders if avail)          mock)
```

On-chain **NFTGardenPassport** stays the lightweight “passport”:
`collection + tokenId → healthScore + spriteCid + dataCid`.  
Backend owns heavy analysis + generation; contract is the optional public receipt.

---

## Core domain

### Entities (Postgres)

1. **collections** — address, name, chain_id, floor_now, floor_ath, holders, traits_schema  
2. **nfts** — collection_id, token_id, owner, minter, name, image_url, traits JSONB  
3. **nft_stats** — floors, trades_window, holders, rarity rank, score, status (`alive|watch|dead`), computed_at  
4. **creatures** — nft_id, brain JSONB (personality / prompt), sprite_key / cid, gen_status, seed  
5. **analysis_runs** — wallet or collection query, status, result snapshot  
6. **cache_entries** — optional generic TTL keys if not Redis-only  

### Health score (server-side, replace mock `data.ts`)

```text
score =
  0.40 * floor_resilience (floor_now / floor_ath)
  + 0.25 * trade_activity
  + 0.20 * holder_spread
  + 0.15 * rarity_signal

status = alive (≥70) | watch (≥46) | dead (<46)
```

Same formula as current FE mock so UI stays stable when wired.

---

## API surface (v1)

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/health` | Liveness |
| `GET` | `/v1/garden/wallet/:address` | Portfolio sandbox: list NFTs + health + creature refs |
| `GET` | `/v1/garden/collection/:address` | Collection sandbox |
| `GET` | `/v1/nfts/:chainId/:collection/:tokenId` | Detail modal payload (minter, floors, holders, traits…) |
| `POST` | `/v1/nfts/:chainId/:collection/:tokenId/analyze` | Force refresh stats (rate limited) |
| `POST` | `/v1/nfts/:chainId/:collection/:tokenId/creature` | Queue pixel creature generation |
| `GET` | `/v1/nfts/:chainId/:collection/:tokenId/creature` | Creature status + sprite URL |
| `GET` | `/v1/creatures/:id` | Direct creature fetch |
| `GET` | `/v1/meta/chains` | Monad testnet/mainnet config for FE |

**Response shape for NFT detail (FE modal):**

```json
{
  "chainId": 10143,
  "collection": "0x…",
  "tokenId": "1001",
  "name": "…",
  "imageUrl": "…",
  "minter": "0x…",
  "owner": "0x…",
  "floorAth": 12.4,
  "floorNow": 3.1,
  "holders": 1820,
  "traits": [{"trait_type":"bg","value":"void"}],
  "traitCount": 6,
  "rarityRank": 120,
  "mints": 5000,
  "trades30d": 44,
  "score": 72,
  "status": "alive",
  "reasons": ["…"],
  "creature": {
    "status": "ready",
    "spriteUrl": "https://…",
    "spriteCid": "ipfs://…",
    "brain": { "mood": "curious", "prompt": "…" }
  }
}
```

---

## Jobs

| Queue | Job | Trigger |
|-------|-----|---------|
| `stats` | Refresh collection/NFT market + on-chain metadata | analyze, cron, cold cache |
| `creature` | Image-to-pixel (or text-to-pixel) generation | first open / user regenerate |
| `pin` | Optional IPFS pin of sprite | after creature ready |
| `passport` | (optional) backend relayer check-in | admin / user-signed later |

Idempotency key: `chainId:collection:tokenId` (lowercase address).

---

## Indexer strategy (phased)

**Phase 0 — Mock adapter** (ship UI + API contract)  
Deterministic hash-based stats (port of `src/data.ts`) so sandbox works offline.

**Phase 1 — RPC + tokenURI**  
- `eth_call` / multicall ownership & `tokenURI`  
- Fetch metadata JSON (IPFS/HTTP gateway)  
- Traits from metadata  

**Phase 2 — Market metrics**  
- Pluggable HTTP: Monad explorer / marketplace / community indexers when available  
- Cache floors in PG + Redis TTL (e.g. 5–15 min)  

**Phase 3 — Real-time**  
- Optional websocket / cron for hot collections  

---

## Creature “brain”

Stored as JSONB, not on-chain:

```json
{
  "seed": "0x…:10143:0xcol:1001",
  "mood": "alive|watch|dead-mapped",
  "persona": "short flavor text",
  "prompt": "pixel art prompt used for gen",
  "source": "hardcoded|user|model",
  "version": 1
}
```

Generation inputs: original NFT image URL (if any) + persona + health status overlay hints.  
Output: PNG in object storage + optional IPFS CID for passport `spriteCid`.

---

## Security / abuse

- Rate limit analyze + creature gen per IP / wallet  
- Allowlist image fetch hosts / SSRF guard on tokenURI  
- No private keys in API (deploy key only in Hardhat/CI)  
- CORS only FE origins  
- Max traits payload size  

---

## Repo layout (target)

```text
monad-nft-garden/
  src/                 # existing Vite FE (unchanged path for now)
  contracts/           # existing Solidity
  server/              # ← backend (this workstream)
    src/
      index.ts
      app.ts
      routes/
      db/
      jobs/
      services/
      adapters/
    drizzle/
    Dockerfile
  docker-compose.yml
  docs/BACKEND_STACK.md
```

Later optional: move FE to `apps/web` when team wants full monorepo.

---

## MVP milestone (backend)

1. Docker Compose up (PG + Redis + API)  
2. Mock adapter: `/v1/garden/wallet/:address` returns 20 creatures compatible with FE fields  
3. NFT detail endpoint for modal  
4. Creature job stub → placeholder pixel sprite URL  
5. FE switches from `makeCollection()` to API (separate FE task)  

---

## Decision owners

| Area | Owner |
|------|--------|
| Backend API / DB / jobs | **us (backend)** |
| Sandbox UI / CSS / sprites | frontend |
| Passport contract | shared (already exists) |
| Image provider API keys | ops / `.env` |

---

*Locked: Hono + Drizzle + Postgres + Redis/BullMQ + viem + S3/R2 + pluggable indexers/image.*
