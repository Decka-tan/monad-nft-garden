export function shortAddress(address: string) {
  if (!address) return "Not connected";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function statusLabel(status: string) {
  if (status === "alive") return "Alive";
  if (status === "watch") return "Watch";
  if (status === "dead") return "Dead";
  return status;
}

export function statusPill(status: string) {
  if (status === "alive") return "Sprout";
  if (status === "watch") return "Watch";
  return "Dormant";
}
