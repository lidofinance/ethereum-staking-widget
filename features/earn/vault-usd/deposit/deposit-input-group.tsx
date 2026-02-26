import { useFormState, useWatch } from 'react-hook-form';

import { InputGroupHookForm } from 'shared/hook-form/controls/input-group-hook-form';
import { TokenAmountInputHookForm } from 'shared/hook-form/controls/token-amount-input-hook-form';
import { TokenSelectHookForm } from 'shared/hook-form/controls/token-select-hook-form/token-select-hook-form';
import { TOKEN_DISPLAY_NAMES } from 'utils/getTokenDisplayName';

import { USD_VAULT_DEPOSIT_TOKENS } from '../consts';
import { USDDepositFormValues } from './form-context/types';
import { useUSDDepositForm } from './form-context';

const trackTokenSelect = (_value: TOKEN_DISPLAY_NAMES) => {
  // TODO: add matomo events
  // switch (value) {
  //   case 'ETH':
  //     trackMatomoEvent(MATOMO_EARN_EVENTS_TYPES.usdVaultSelectTokenEth);
  //     break;
  //   case 'wETH':
  //     trackMatomoEvent(MATOMO_EARN_EVENTS_TYPES.usdVaultSelectTokenWeth);
  //     break;
  //   case 'wstETH':
  //     trackMatomoEvent(MATOMO_EARN_EVENTS_TYPES.usdVaultSelectTokenWsteth);
  //     break;
  //   default:
  //     break;
  // }
};

const OPTIONS = USD_VAULT_DEPOSIT_TOKENS.map((token) => ({ token }));

export const UsdVaultDepositInputGroup = () => {
  const token = useWatch<USDDepositFormValues, 'token'>({ name: 'token' });
  const { maxAmount } = useUSDDepositForm();

  const { disabled } = useFormState();

  return (
    <InputGroupHookForm errorField="amount" bottomSpacing={false}>
      <TokenSelectHookForm
        errorField="amount"
        fieldName="token"
        resetField="amount"
        disabled={disabled}
        options={OPTIONS}
        onChange={trackTokenSelect}
      />
      <TokenAmountInputHookForm
        disabled={disabled}
        fieldName="amount"
        token={token}
        data-testid="USD-vault-deposit-input"
        maxValue={maxAmount}
        showErrorMessage={false}
        onMaxClick={() => {
          // trackMatomoEvent(MATOMO_EARN_EVENTS_TYPES.usdVaultDepositMax); // TODO: add matomo event for USD vault max click
        }}
      />
    </InputGroupHookForm>
  );
};
