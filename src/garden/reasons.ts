import type { NftHealth } from "../types";

export function buildReason(nft: NftHealth) {
  if (nft.reasons?.length) {
    return nft.reasons.join(" ");
  }

  if (nft.status === "alive") {
    return (
      "Floor holds up, trades are still happening, " +
      "and holders are spread out. Looks active."
    );
  }

  if (nft.status === "watch") {
    return (
      "Still has holders, but floor or trade pace " +
      "is slipping. Worth a second look."
    );
  }

  return (
    "Trades dried up and floor dropped hard. " +
    "Holder count alone is not saving it."
  );
}
