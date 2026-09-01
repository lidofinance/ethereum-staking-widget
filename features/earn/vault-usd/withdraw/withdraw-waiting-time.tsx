import { useWatch } from 'react-hook-form';

import { VaultTxInfoRow } from 'features/earn/shared/vault-tx-info';

import { USD_WITHDRAW_TOKEN_TEXT } from './consts';
import { asUsdWithdrawToken } from '../utils';
import { UsdVaultWithdrawFormValues } from './form-context/types';

export const UsdVaultWithdrawWaitingTime = () => {
  const token = useWatch<UsdVaultWithdrawFormValues, 'token'>({
    name: 'token',
  });
  const { waitingTime, waitingTimeTooltip } =
    USD_WITHDRAW_TOKEN_TEXT[asUsdWithdrawToken(token)];

  return (
    <VaultTxInfoRow
      title="Waiting time"
      data-testid="waiting-time"
      help={waitingTimeTooltip}
    >
      {waitingTime}
    </VaultTxInfoRow>
  );
};
