import { integer, jsonb, pgEnum, pgTable, text, timestamp, uniqueIndex, uuid, varchar } from "drizzle-orm/pg-core";

export const healthStatusEnum = pgEnum("health_status", ["alive", "watch", "dead"]);
export const creatureStatusEnum = pgEnum("creature_status", ["none", "queued", "generating", "ready", "failed"]);

export const collections = pgTable(
  "collections",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    chainId: integer("chain_id").notNull(),
    address: varchar("address", { length: 42 }).notNull(),
    name: text("name"),
    floorNow: text("floor_now"),
    floorAth: text("floor_ath"),
    holders: integer("holders"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [uniqueIndex("collections_chain_address").on(t.chainId, t.address)],
);

export const nfts = pgTable(
  "nfts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    collectionId: uuid("collection_id")
      .notNull()
      .references(() => collections.id, { onDelete: "cascade" }),
    tokenId: text("token_id").notNull(),
    name: text("name"),
    imageUrl: text("image_url"),
    owner: varchar("owner", { length: 42 }),
    minter: varchar("minter", { length: 42 }),
    traits: jsonb("traits").$type<Array<{ trait_type: string; value: string }>>().default([]),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [uniqueIndex("nfts_collection_token").on(t.collectionId, t.tokenId)],
);

export const nftStats = pgTable(
  "nft_stats",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    nftId: uuid("nft_id")
      .notNull()
      .references(() => nfts.id, { onDelete: "cascade" })
      .unique(),
    floorAth: text("floor_ath").notNull(),
    floorNow: text("floor_now").notNull(),
    trades30d: integer("trades_30d").notNull().default(0),
    holders: integer("holders").notNull().default(0),
    traitCount: integer("trait_count").notNull().default(0),
    rarityRank: integer("rarity_rank"),
    mints: integer("mints"),
    score: integer("score").notNull(),
    status: healthStatusEnum("status").notNull(),
    reasons: jsonb("reasons").$type<string[]>().default([]),
    computedAt: timestamp("computed_at", { withTimezone: true }).defaultNow().notNull(),
  },
);

export const creatures = pgTable(
  "creatures",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    nftId: uuid("nft_id")
      .notNull()
      .references(() => nfts.id, { onDelete: "cascade" })
      .unique(),
    status: creatureStatusEnum("status").notNull().default("none"),
    seed: text("seed").notNull(),
    brain: jsonb("brain").$type<Record<string, unknown>>().default({}),
    spriteUrl: text("sprite_url"),
    spriteCid: text("sprite_cid"),
    error: text("error"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
);

export const analysisRuns = pgTable("analysis_runs", {
  id: uuid("id").defaultRandom().primaryKey(),
  kind: text("kind").notNull(), // wallet | collection | nft
  queryKey: text("query_key").notNull(),
  status: text("status").notNull().default("done"),
  payload: jsonb("payload").$type<Record<string, unknown>>().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
