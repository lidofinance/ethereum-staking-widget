import { useStableToUsd } from 'shared/hooks/use-stable-to-usd';
import { USDC_DECIMALS } from 'features/earn/vault-usd/consts';

export const useUsdcToUsd = (amount?: bigint) => {
  const { stableAmount: usdcAmount, usdAmount } = useStableToUsd(
    amount,
    USDC_DECIMALS,
  );

  return {
    usdcAmount,
    usdAmount,
  };
};
