import { VaultAvailable } from 'features/earn/shared/vault-available';
import { useDVVDepositForm } from './form-context';
import { getTokenSymbol } from 'utils/get-token-symbol';

export const DVVDepositAvailable = () => {
  const { token, isLoading, maxAmount } = useDVVDepositForm();

  return (
    <VaultAvailable
      label="Available to deposit"
      symbol={getTokenSymbol(token)}
      amount={maxAmount}
      isLoading={isLoading}
    />
  );
};
