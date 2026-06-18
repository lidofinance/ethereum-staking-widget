import { useMemo } from 'react';
import { bnAmountToNumber } from 'utils/bn';

/**
 * Converts a stable-denominated bigint amount into display-friendly stable and USD values.
 * Assumes a 1:1 stablecoin-to-USD conversion.
 */
export const useStableToUsd = (amount?: bigint, decimals = 6) => {
  const stableAmount = useMemo(() => {
    if (amount == null || amount === 0n) return 0;

    return bnAmountToNumber(amount, decimals);
  }, [amount, decimals]);

  return {
    stableAmount,
    usdAmount: stableAmount,
  };
};
