// keep old import path working
export type {
  HealthStatus,
  NftTrait,
  CreatureDto,
  NftDetailDto,
  GardenResponse,
} from "../types.js";

export {
  mockGarden,
  mockNftDetail,
} from "../garden/mock.js";

export { hashString } from "../lib/hash.js";
export { scoreHealth, brainFor } from "../garden/health.js";
