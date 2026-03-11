import { useMemo } from 'react';
import { bnAmountToNumber } from 'utils/bn';

const USDT_DECIMALS = 6n;

export const useUsdtUsd = (amount?: bigint) => {
  const usdtAmount = useMemo(() => {
    if (amount == 0n) return 0;

    return bnAmountToNumber(amount, Number(USDT_DECIMALS));
  }, [amount]);

  // Assuming 1 USDT = 1 USD, so we can directly use the USDT amount as USD amount
  // TODO: consider fetching USDT to USD price
  const usdAmount = usdtAmount;

  return {
    usdtAmount,
    usdAmount,
  };
};
