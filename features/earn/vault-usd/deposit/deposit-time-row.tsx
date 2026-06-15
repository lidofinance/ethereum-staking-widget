import { useWatch } from 'react-hook-form';
import invariant from 'tiny-invariant';

import { VaultTxInfoRow } from 'features/earn/shared/vault-tx-info';
import { TOKEN_SYMBOLS } from 'consts/tokens';

import { USDDepositFormValues } from './form-context/types';

export const UsdVaultDepositTimeRow = () => {
  const { token } = useWatch<USDDepositFormValues>();
  invariant(token, 'Token is required');
  const isInstant = token !== TOKEN_SYMBOLS.usde;
  return (
    <VaultTxInfoRow title="Deposit time">
      {isInstant ? 'Instant' : 'up to 24 hours'}
    </VaultTxInfoRow>
  );
};
