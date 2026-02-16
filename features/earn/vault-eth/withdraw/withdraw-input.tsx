import { useFormState } from 'react-hook-form';

import { InputGroupHookForm } from 'shared/hook-form/controls/input-group-hook-form';
import { TokenAmountInputHookForm } from 'shared/hook-form/controls/token-amount-input-hook-form';
import { TokenEarnethIcon } from 'assets/earn-v2';

import { useEthVaultWithdrawForm } from './form-context';
import { ETH_VAULT_TOKEN_SYMBOL } from '../consts';

export const EthVaultWithdrawInput: React.FC = () => {
  const { maxAmount } = useEthVaultWithdrawForm();
  const { disabled } = useFormState();

  return (
    <InputGroupHookForm errorField="amount" bottomSpacing={false}>
      <TokenAmountInputHookForm
        leftDecorator={<TokenEarnethIcon width={24} height={24} />}
        disabled={disabled}
        fieldName="amount"
        token={ETH_VAULT_TOKEN_SYMBOL}
        data-testid="eth-withdraw-input"
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
