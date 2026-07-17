import type { HealthStatus } from "../types.js";

export function scoreHealth(input: {
  floorAth: number;
  floorNow: number;
  trades30d: number;
  holders: number;
  rarityRank: number;
}) {
  const floorBase = Math.max(input.floorAth, 0.01);
  const resilience = Math.round(
    (input.floorNow / floorBase) * 100,
  );
  const tradeScore = Math.min(100, input.trades30d * 2);
  const holderScore = Math.min(
    100,
    Math.round(input.holders / 42),
  );
  const rarityScore = Math.max(
    20,
    100 - Math.round(input.rarityRank / 10),
  );

  const score = Math.round(
    resilience * 0.4 +
      tradeScore * 0.25 +
      holderScore * 0.2 +
      rarityScore * 0.15,
  );

  let status: HealthStatus = "dead";
  if (score >= 70) status = "alive";
  else if (score >= 46) status = "watch";

  const reasons = [
    `Floor resilience ${resilience}% ` +
      `(now ${input.floorNow} / ATH ${input.floorAth})`,
    `Trade score ${tradeScore} from ` +
      `${input.trades30d} trades (30d)`,
    `Holder score ${holderScore} from ` +
      `${input.holders} holders`,
    `Rarity score ${rarityScore} (rank ${input.rarityRank})`,
  ];

  return { score, status, reasons };
}

export function brainFor(
  status: HealthStatus,
  name: string,
  seed: number,
) {
  const mood =
    status === "alive"
      ? "lively"
      : status === "watch"
        ? "wary"
        : "dormant";

  return {
    seed,
    mood,
    persona: `${name} feels ${mood} in the Monad garden.`,
    prompt:
      `pixel art creature, 64x64, ${mood}, ` +
      `neon garden, monad purple accents, NFT ${name}`,
    source: "hardcoded",
    version: 1,
  };
}
