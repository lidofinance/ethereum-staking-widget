import { useFormState } from 'react-hook-form';

import { VaultInputGroupHookForm } from 'features/earn/shared/vault-input-group-hook-form';
import { TokenAmountInputHookForm } from 'shared/hook-form/controls/token-amount-input-hook-form';
import { TokenEarnUsdIcon } from 'assets/earn-v2';
import { trackMatomoEvent } from 'utils/track-matomo-event';
import { MATOMO_EARN_EVENTS_TYPES } from 'consts/matomo';

import { useUsdVaultWithdrawForm } from './form-context';
import { USD_VAULT_TOKEN_SYMBOL } from '../consts';

export const UsdVaultWithdrawInput: React.FC = () => {
  const { maxAmount } = useUsdVaultWithdrawForm();
  const { disabled } = useFormState();

  return (
    <VaultInputGroupHookForm errorField="amount">
      <TokenAmountInputHookForm
        leftDecorator={<TokenEarnUsdIcon width={24} height={24} />}
        disabled={disabled}
        fieldName="amount"
        token={USD_VAULT_TOKEN_SYMBOL}
        data-testid="withdraw-input"
        maxValue={maxAmount}
        showErrorMessage={false}
        onMaxClick={() => {
          trackMatomoEvent(MATOMO_EARN_EVENTS_TYPES.earnUsdWithdrawalMax);
        }}
      />
    </VaultInputGroupHookForm>
  );
};
