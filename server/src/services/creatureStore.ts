import type { CreatureDto } from "../types.js";

type Key = string;
type Row = CreatureDto & { updatedAt: number };

function makeKey(
  chainId: number,
  collection: string,
  tokenId: string,
): Key {
  return `${chainId}:${collection.toLowerCase()}:${tokenId}`;
}

function toDto(row: Row): CreatureDto {
  return {
    status: row.status,
    spriteUrl: row.spriteUrl,
    spriteCid: row.spriteCid,
    brain: row.brain,
  };
}

// in-memory only; swap for PG + BullMQ later
class CreatureStore {
  private map = new Map<Key, Row>();

  get(
    chainId: number,
    collection: string,
    tokenId: string,
  ): CreatureDto | null {
    const row = this.map.get(
      makeKey(chainId, collection, tokenId),
    );
    return row ? toDto(row) : null;
  }

  queue(
    chainId: number,
    collection: string,
    tokenId: string,
    persona?: string,
  ): CreatureDto {
    const k = makeKey(chainId, collection, tokenId);
    const short = collection.slice(0, 8);
    const brain = {
      seed: k,
      mood: "awakening",
      persona:
        persona ||
        `Sandbox creature for ${short}…#${tokenId}`,
      prompt:
        `pixel art 64x64 monad garden creature, ` +
        `token ${tokenId}`,
      source: persona ? "user" : "hardcoded",
      version: 1,
    };

    const queued: Row = {
      status: "queued",
      spriteUrl: null,
      spriteCid: null,
      brain,
      updatedAt: Date.now(),
    };
    this.map.set(k, queued);

    // mock worker: flip to ready after short delay
    setTimeout(() => {
      const cur = this.map.get(k);
      if (!cur || cur.status === "ready") return;

      const idx = (Number(tokenId) % 20) + 1;
      const pad = String(idx).padStart(2, "0");

      this.map.set(k, {
        ...cur,
        status: "ready",
        spriteUrl: `/assets/creatures/creature-${pad}.png`,
        spriteCid: null,
        brain: { ...cur.brain, mood: "ready" },
        updatedAt: Date.now(),
      });
    }, 800);

    return toDto(queued);
  }
}

export const creatureStore = new CreatureStore();
