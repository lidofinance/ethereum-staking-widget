import { VaultAvailable } from 'features/earn/shared/vault-available';

import { useGGVPosition } from '../hooks/use-ggv-position';
import { useGGVAvailable } from '../hooks/use-ggv-available';
import { GGV_TOKEN_SYMBOL } from '../consts';
import { useGGVWithdrawForm } from './form-context';

export const GGVWithdrawAvailable = () => {
  const { isLoading, data } = useGGVPosition();
  const { isGGVAvailable } = useGGVAvailable();
  const { canWithdraw } = useGGVWithdrawForm();

  const amount =
    canWithdraw && isGGVAvailable ? data?.sharesBalance : undefined;

  return (
    <VaultAvailable
      isLoading={isLoading}
      label="Available to withdraw"
      amount={amount}
      symbol={GGV_TOKEN_SYMBOL}
    />
  );
};
