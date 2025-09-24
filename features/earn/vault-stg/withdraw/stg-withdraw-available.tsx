import { VaultAvailable } from 'features/earn/shared/vault-available';
import { useSTGWithdrawForm } from './form-context';
import { STG_TOKEN_SYMBOL } from '../consts';

export const STGWithdrawAvailable: React.FC = () => {
  const { isLoading, maxAmount } = useSTGWithdrawForm();

  return (
    <VaultAvailable
      isLoading={isLoading}
      label="Available to withdraw"
      amount={maxAmount}
      symbol={STG_TOKEN_SYMBOL}
    />
  );
};
