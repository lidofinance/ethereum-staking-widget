import { VaultAvailable } from 'features/earn/shared/vault-available';
import { useETHDepositForm } from './form-context';

export const EthVaultAvailableDeposit = () => {
  const { isLoading, maxAmount, token } = useETHDepositForm();

  return (
    <VaultAvailable
      isLoading={isLoading}
      label="Available to deposit"
      amount={maxAmount}
      symbol={token}
    />
  );
};
