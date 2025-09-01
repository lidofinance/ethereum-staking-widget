import { VaultAvailable } from 'features/earn/shared/vault-available';
import { useGGVPosition } from '../hooks/use-ggv-position';
import { GGV_TOKEN_SYMBOL } from '../consts';
import { useGGVWithdrawForm } from './form-context';

export const GGVWithdrawAvailable = () => {
  const { isLoading, data } = useGGVPosition();
  const { canWithdraw } = useGGVWithdrawForm();

  const amount = canWithdraw === false ? undefined : data?.sharesBalance;

  return (
    <VaultAvailable
      isLoading={isLoading}
      label="Available to withdraw"
      amount={amount}
      symbol={GGV_TOKEN_SYMBOL}
    />
  );
};
