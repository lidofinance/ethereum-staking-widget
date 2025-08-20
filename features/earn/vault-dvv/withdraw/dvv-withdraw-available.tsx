import { VaultAvailable } from 'features/earn/shared/vault-available';
import { getTokenDisplayName } from 'utils/getTokenDisplayName';
import { useDVVPosition } from '../hooks/use-dvv-position';

export const DVVWithdrawAvailable = () => {
  const { data, isLoading } = useDVVPosition();

  return (
    <VaultAvailable
      label="Available to withdraw"
      symbol={getTokenDisplayName('dvstETH')}
      amount={data?.sharesBalance}
      isLoading={isLoading}
    />
  );
};
