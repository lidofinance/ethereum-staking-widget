import { useStableToUsd } from 'shared/hooks/use-stable-to-usd';
import { USDT_DECIMALS } from 'features/earn/vault-usd/consts';

export const useUsdtToUsd = (amount?: bigint) => {
  const { stableAmount: usdtAmount, usdAmount } = useStableToUsd(
    amount,
    USDT_DECIMALS,
  );

  return {
    usdtAmount,
    usdAmount,
  };
};
