import { VaultAvailable } from 'features/earn/shared/vault-available';
import { useUsdVaultWithdrawForm } from './form-context';
import { USD_VAULT_TOKEN_SYMBOL } from '../consts';

export const UsdVaultWithdrawAvailable: React.FC = () => {
  const { isLoading, maxAmount } = useUsdVaultWithdrawForm();

  return (
    <VaultAvailable
      isLoading={isLoading}
      label="Available to withdraw"
      amount={maxAmount}
      symbol={USD_VAULT_TOKEN_SYMBOL}
    />
  );
};
