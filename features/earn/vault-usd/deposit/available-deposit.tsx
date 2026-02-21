import { VaultAvailable } from 'features/earn/shared/vault-available';
import { useUSDDepositForm } from './form-context';

export const UsdVaultAvailableDeposit = () => {
  const { isLoading, maxAmount, token } = useUSDDepositForm();

  return (
    <VaultAvailable
      isLoading={isLoading}
      label="Available to deposit"
      amount={maxAmount}
      symbol={token}
      decimals={6}
    />
  );
};
