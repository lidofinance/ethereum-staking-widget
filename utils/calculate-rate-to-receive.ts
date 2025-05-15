const RATE_PRECISION = 100000;
const RATE_PRECISION_BIG_INT = BigInt(RATE_PRECISION);

export type RateCalculationResult = { rate: number; toReceive: bigint };

export const calculateRateReceive = (
  amount: bigint,
  fromAmount: bigint,
  toAmount: bigint,
): RateCalculationResult => {
  const _rate = (toAmount * RATE_PRECISION_BIG_INT) / fromAmount;
  const rate = Number(_rate) / RATE_PRECISION;
  // if original amount is capped
  const toReceive =
    amount === fromAmount ? toAmount : (amount * toAmount) / fromAmount;
  return { rate, toReceive };
};
