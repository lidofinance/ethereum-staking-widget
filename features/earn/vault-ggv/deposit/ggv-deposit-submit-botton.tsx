import { useDappStatus } from 'modules/web3';
import { VaultSubmitButton } from 'features/earn/shared/vault-submit-button';

import { isGGVAvailable } from '../utils';

export const GGVDepositSubmitButton = () => {
  const { chainId } = useDappStatus();

  const isAvailable = isGGVAvailable(chainId);

  return (
    <VaultSubmitButton isAvailable={isAvailable}>Deposit</VaultSubmitButton>
  );
};
