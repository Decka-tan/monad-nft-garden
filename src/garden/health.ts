import type { Status } from "../types";

export function scoreFromStats(input: {
  floorAth: number;
  floorNow: number;
  trades: number;
  holders: number;
  rarity: number;
}) {
  const floorRatio =
    input.floorNow / Math.max(input.floorAth, 0.01);
  const resilience = Math.round(floorRatio * 100);
  const tradeScore = Math.min(100, input.trades * 2);
  const holderScore = Math.min(
    100,
    Math.round(input.holders / 42),
  );
  const rarityScore = Math.max(
    20,
    100 - Math.round(input.rarity / 10),
  );

  const score = Math.round(
    resilience * 0.4 +
      tradeScore * 0.25 +
      holderScore * 0.2 +
      rarityScore * 0.15,
  );

  let status: Status = "dead";
  if (score >= 70) status = "alive";
  else if (score >= 46) status = "watch";

  return { score, status, resilience, tradeScore, holderScore, rarityScore };
}
