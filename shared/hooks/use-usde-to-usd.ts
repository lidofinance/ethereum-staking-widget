import { useStableToUsd } from 'shared/hooks/use-stable-to-usd';
import { USDE_DECIMALS } from 'features/earn/vault-usd/consts';

export const useUsdeToUsd = (amount?: bigint) => {
  const { stableAmount: usdeAmount, usdAmount } = useStableToUsd(
    amount,
    USDE_DECIMALS,
  );

  return {
    usdeAmount,
    usdAmount,
  };
};
