import { useFormState } from 'react-hook-form';

import { InputGroupHookForm } from 'shared/hook-form/controls/input-group-hook-form';
import { TokenAmountInputHookForm } from 'shared/hook-form/controls/token-amount-input-hook-form';
import { TokenEarnUsdIcon } from 'assets/earn-v2';

import { useUsdVaultWithdrawForm } from './form-context';
import { USD_VAULT_TOKEN_SYMBOL } from '../consts';

export const UsdVaultWithdrawInput: React.FC = () => {
  const { maxAmount } = useUsdVaultWithdrawForm();
  const { disabled } = useFormState();

  return (
    <InputGroupHookForm errorField="amount" bottomSpacing={false}>
      <TokenAmountInputHookForm
        leftDecorator={<TokenEarnUsdIcon width={24} height={24} />}
        disabled={disabled}
        fieldName="amount"
        token={USD_VAULT_TOKEN_SYMBOL}
        data-testid="usd-withdraw-input"
        maxValue={maxAmount}
        showErrorMessage={false}
        onMaxClick={() => {
          // trackMatomoEvent(MATOMO_EARN_EVENTS_TYPES.strategyWithdrawalMax);
          // TODO: add matomo event for max click
        }}
      />
    </InputGroupHookForm>
  );
};
