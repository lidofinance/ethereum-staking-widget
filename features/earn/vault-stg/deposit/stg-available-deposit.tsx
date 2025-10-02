import { VaultAvailable } from 'features/earn/shared/vault-available';
import { useSTGDepositForm } from './form-context';

export const STGAvailableDeposit = () => {
  const { isLoading, maxAmount, token } = useSTGDepositForm();

  return (
    <VaultAvailable
      isLoading={isLoading}
      label="Available to deposit"
      amount={maxAmount}
      symbol={token}
    />
  );
};
