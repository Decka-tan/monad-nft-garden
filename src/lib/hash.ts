// simple fNV-ish hash, good enough for demo seeds
export function hashString(value: string) {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function randomFrom(seed: number, min: number, max: number) {
  const value = Math.sin(seed) * 10000;
  const frac = value - Math.floor(value);
  return Math.floor(frac * (max - min + 1)) + min;
}
