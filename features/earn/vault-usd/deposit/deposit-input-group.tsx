import { useFormState, useWatch } from 'react-hook-form';

import { InputGroupHookForm } from 'shared/hook-form/controls/input-group-hook-form';
import { TokenAmountInputHookForm } from 'shared/hook-form/controls/token-amount-input-hook-form';
import { TokenSelectHookForm } from 'shared/hook-form/controls/token-select-hook-form/token-select-hook-form';
import { UsdDepositToken } from 'features/earn/vault-usd/types';
import { trackMatomoEvent } from 'utils/track-matomo-event';
import { TOKENS, TOKEN_SYMBOLS } from 'consts/tokens';
import { MATOMO_EARN_EVENTS_TYPES } from 'consts/matomo';

import { USD_VAULT_DEPOSIT_TOKENS } from '../consts';
import { USDDepositFormValues } from './form-context/types';
import { useUSDDepositForm } from './form-context';

const trackTokenSelect = (value: string) => {
  const token = value.toLowerCase() as UsdDepositToken;
  switch (token) {
    case TOKENS.usdc:
      trackMatomoEvent(MATOMO_EARN_EVENTS_TYPES.earnUsdSelectTokenUsdc);
      break;
    case TOKENS.usdt:
      trackMatomoEvent(MATOMO_EARN_EVENTS_TYPES.earnUsdSelectTokenUsdt);
      break;
    default:
      break;
  }
};

const OPTIONS = USD_VAULT_DEPOSIT_TOKENS.map((token) => ({
  token: TOKEN_SYMBOLS[token],
}));

export const UsdVaultDepositInputGroup = () => {
  const tokenSymbol = useWatch<USDDepositFormValues, 'token'>({
    name: 'token',
  });
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
        token={tokenSymbol}
        data-testid="USD-vault-deposit-input"
        maxValue={maxAmount}
        showErrorMessage={false}
        onMaxClick={() => {
          trackMatomoEvent(MATOMO_EARN_EVENTS_TYPES.earnUsdDepositMax);
        }}
      />
    </InputGroupHookForm>
  );
};
