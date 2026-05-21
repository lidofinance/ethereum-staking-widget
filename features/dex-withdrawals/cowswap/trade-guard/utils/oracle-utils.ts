import { PRICE_BOUNDS } from '../consts';

// Pure oracle helpers and constants — no React/wagmi imports.
// Kept separate so they're testable without pulling in wagmi ESM.

export type RoundData = readonly [bigint, bigint, bigint, bigint, bigint];

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
