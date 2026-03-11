import { VaultAvailable } from 'features/earn/shared/vault-available';
import { useEthVaultWithdrawForm } from './form-context';
import { ETH_VAULT_TOKEN_SYMBOL } from '../consts';

export const EthVaultWithdrawAvailable: React.FC = () => {
  const { isLoading, maxAmount } = useEthVaultWithdrawForm();

  return (
    <VaultAvailable
      isLoading={isLoading}
      label="Available to withdraw"
      amount={maxAmount}
      symbol={ETH_VAULT_TOKEN_SYMBOL}
    />
  );
};
