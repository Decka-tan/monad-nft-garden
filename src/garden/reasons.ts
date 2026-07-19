import type { NftHealth } from "../types";

function floorRetention(nft: NftHealth) {
  if (!nft.floorAth) return 0;
  return Math.round((nft.floorNow / nft.floorAth) * 100);
}

export function buildReason(nft: NftHealth) {
  if (nft.reasons?.length) {
    return nft.reasons.join(" ");
  }

  const retention = floorRetention(nft);
  const holders = nft.holders.toLocaleString();

  if (nft.status === "alive") {
    return (
      `Floor is holding around ${retention}% of ATH, ` +
      `${nft.trades} trades landed in 30d, and ${holders} ` +
      "holders are still spread across the collection."
    );
  }

  if (nft.status === "watch") {
    return (
      `Floor is at ${retention}% of ATH with ${nft.trades} ` +
      `recent trades. ${holders} holders remain, but the pulse ` +
      "is not strong enough to call it fully alive."
    );
  }

  return (
    `Floor sits around ${retention}% of ATH and only ` +
    `${nft.trades} trades landed in 30d. Holder count alone ` +
    "is not keeping this one awake."
  );
}
