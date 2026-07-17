import type { NftHealth } from "../types";
import { hashString, randomFrom } from "../lib/hash";
import { CREATURE_NAMES, COLOR_PAIRS } from "./names";
import { scoreFromStats } from "./health";

// offline fallback when API is down
export function makeCollection(seedText: string): NftHealth[] {
  const base = hashString(seedText || "monad");

  return CREATURE_NAMES.map((name, index) => {
    const seed = base + index * 9973;
    const floorAth =
      randomFrom(seed, 4, 18) +
      randomFrom(seed + 3, 0, 9) / 10;
    const floorNow = Math.max(
      0.2,
      floorAth * (randomFrom(seed + 1, 34, 94) / 100),
    );
    const trades = randomFrom(seed + 2, 0, 82);
    const holders = randomFrom(seed + 4, 110, 4200);
    const traits = randomFrom(seed + 5, 4, 14);
    const rarity = randomFrom(seed + 6, 1, 980);
    const mints = randomFrom(seed + 7, 18, 9900);

    const { score, status } = scoreFromStats({
      floorAth,
      floorNow,
      trades,
      holders,
      rarity,
    });

    const hex = seed.toString(16);
    const minter =
      `0x${(hex + "ab12cd34ef56").slice(0, 12)}` +
      `...${(seed * 17).toString(16).slice(-4)}`;

    return {
      id: index + 1,
      tokenId: 1000 + index,
      name,
      seed,
      score,
      status,
      floorAth,
      floorNow,
      trades,
      holders,
      traits,
      rarity,
      mints,
      minter,
      colors: COLOR_PAIRS[index % COLOR_PAIRS.length],
      size: randomFrom(seed + 8, 54, 86),
      tilt: randomFrom(seed + 9, -7, 7),
    };
  });
}
