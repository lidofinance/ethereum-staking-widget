import { useMemo } from 'react';
import { bnAmountToNumber } from 'utils/bn';

const USDC_DECIMALS = 6n;

export const useUsdcUsd = (amount?: bigint) => {
  const usdcAmount = useMemo(() => {
    if (amount == 0n) return 0;

    return bnAmountToNumber(amount, Number(USDC_DECIMALS));
  }, [amount]);

  // Assuming 1 USDC = 1 USD, so we can directly use the USDC amount as USD amount
  // TODO: consider fetching USDC to USD price
  const usdAmount = usdcAmount;

  return {
    usdcAmount,
    usdAmount,
  };
};
