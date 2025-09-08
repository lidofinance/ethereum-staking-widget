import { useGGVDepositForm } from './form-context';
import { VaultAvailable } from 'features/earn/shared/vault-available';

export const GGVAvailableDeposit = () => {
  const { maxAmount, token, isLoading } = useGGVDepositForm();
  return (
    <VaultAvailable
      isLoading={isLoading}
      label="Available to deposit"
      amount={maxAmount}
      symbol={token}
    />
  );
};
