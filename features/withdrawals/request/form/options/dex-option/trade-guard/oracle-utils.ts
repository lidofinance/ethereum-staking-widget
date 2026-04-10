// Pure oracle helpers and constants — no React/wagmi imports.
// Kept separate so they're testable without pulling in wagmi ESM.

export type RoundData = readonly [bigint, bigint, bigint, bigint, bigint];

export const CHAINLINK_SCALE = 10n ** 8n;
export const WSTETH_SCALE = 10n ** 18n;
export const WSTETH_RATE_MIN = 10n ** 18n;
export const WSTETH_RATE_MAX = 2n * 10n ** 18n; // 2.0 — ~14 years runway at 5% APR

// Per-feed price sanity bounds (8 decimals)
export const PRICE_BOUNDS: Record<string, { min: bigint; max: bigint }> = {
  ETH_USD: { min: 50n * CHAINLINK_SCALE, max: 20_000n * CHAINLINK_SCALE },
  STETH_USD: { min: 50n * CHAINLINK_SCALE, max: 20_000n * CHAINLINK_SCALE },
  USDC_USD: { min: CHAINLINK_SCALE / 2n, max: 2n * CHAINLINK_SCALE },
  USDT_USD: { min: CHAINLINK_SCALE / 2n, max: 2n * CHAINLINK_SCALE },
  DAI_USD: { min: CHAINLINK_SCALE / 2n, max: 2n * CHAINLINK_SCALE },
  BTC_USD: { min: 1_000n * CHAINLINK_SCALE, max: 1_000_000n * CHAINLINK_SCALE },
};

export const isValidRound = (
  roundData: RoundData,
  maxStaleness: number,
  nowSec: bigint,
): boolean => {
  const [roundId, answer, , updatedAt, answeredInRound] = roundData;
  if (answer <= 0n) return false;
  if (answeredInRound < roundId) return false;
  if (updatedAt > nowSec + 60n) return false;
  return nowSec - updatedAt <= BigInt(maxStaleness);
};

export const isInBounds = (answer: bigint, feedKey: string): boolean => {
  const bounds = PRICE_BOUNDS[feedKey];
  if (!bounds) return false;
  return answer >= bounds.min && answer <= bounds.max;
};
