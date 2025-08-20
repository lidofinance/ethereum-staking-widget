import { VaultAvailable } from 'features/earn/shared/vault-available';
import { useGGVPosition } from '../hooks/use-ggv-position';
import { GGV_TOKEN_SYMBOL } from '../consts';

export const GGVWithdrawAvailable = () => {
  const { isLoading, data } = useGGVPosition();
  return (
    <VaultAvailable
      isLoading={isLoading}
      label="Available to withdraw"
      amount={data?.sharesBalance}
      symbol={GGV_TOKEN_SYMBOL}
    />
  );
};
