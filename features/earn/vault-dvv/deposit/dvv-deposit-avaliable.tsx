import { VaultAvailable } from 'features/earn/shared/vault-available';
import { useDVVDepositForm } from './form-context';
import { getTokenDisplayName } from 'utils/getTokenDisplayName';

export const DVVDepositAvailable = () => {
  const { token, isLoading, maxAmount } = useDVVDepositForm();

  return (
    <VaultAvailable
      label="Available to deposit"
      symbol={getTokenDisplayName(token)}
      amount={maxAmount}
      isLoading={isLoading}
    />
  );
};
