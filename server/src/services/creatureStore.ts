import type { CreatureDto } from "./mockGarden.js";

type Key = string;

function key(chainId: number, collection: string, tokenId: string): Key {
  return `${chainId}:${collection.toLowerCase()}:${tokenId}`;
}

/** In-memory creature queue for MOCK_MODE. Replace with PG + BullMQ later. */
class CreatureStore {
  private map = new Map<Key, CreatureDto & { updatedAt: number }>();

  get(chainId: number, collection: string, tokenId: string): CreatureDto | null {
    const row = this.map.get(key(chainId, collection, tokenId));
    return row ? { status: row.status, spriteUrl: row.spriteUrl, spriteCid: row.spriteCid, brain: row.brain } : null;
  }

  queue(chainId: number, collection: string, tokenId: string, persona?: string): CreatureDto {
    const k = key(chainId, collection, tokenId);
    const brain = {
      seed: k,
      mood: "awakening",
      persona: persona || `Sandbox creature for ${collection.slice(0, 8)}…#${tokenId}`,
      prompt: `pixel art 64x64 monad garden creature, token ${tokenId}`,
      source: persona ? "user" : "hardcoded",
      version: 1,
    };

    const queued: CreatureDto & { updatedAt: number } = {
      status: "queued",
      spriteUrl: null,
      spriteCid: null,
      brain,
      updatedAt: Date.now(),
    };
    this.map.set(k, queued);

    // MOCK: complete after short async tick without external image API
    setTimeout(() => {
      const cur = this.map.get(k);
      if (!cur || cur.status === "ready") return;
      const idx = (Number(tokenId) % 20) + 1;
      this.map.set(k, {
        ...cur,
        status: "ready",
        spriteUrl: `/assets/creatures/creature-${String(idx).padStart(2, "0")}.png`,
        spriteCid: null,
        brain: { ...cur.brain, mood: "ready" },
        updatedAt: Date.now(),
      });
    }, 800);

    return { status: queued.status, spriteUrl: queued.spriteUrl, spriteCid: queued.spriteCid, brain: queued.brain };
  }
}

export const creatureStore = new CreatureStore();
