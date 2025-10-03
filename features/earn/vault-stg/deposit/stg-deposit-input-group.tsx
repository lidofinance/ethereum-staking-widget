import { useFormState, useWatch } from 'react-hook-form';

import { BALANCE_PADDING, useAA } from 'modules/web3';
import { InputGroupHookForm } from 'shared/hook-form/controls/input-group-hook-form';
import { TokenAmountInputHookForm } from 'shared/hook-form/controls/token-amount-input-hook-form';
import { TokenSelectHookForm } from 'shared/hook-form/controls/token-select-hook-form/token-select-hook-form';
import { useTokenMaxAmount } from 'shared/hooks/use-token-max-amount';
import { TOKEN_DISPLAY_NAMES } from 'utils/getTokenDisplayName';
import { trackMatomoEvent } from 'utils/track-matomo-event';
import { MATOMO_EARN_EVENTS_TYPES } from 'consts/matomo';

import { STG_DEPOSABLE_TOKENS } from '../consts';
import { STGDepositFormValues } from './form-context/types';
import { useSTGDepositEthGasLimit } from './hooks/use-stg-deposit-eth-gas-limit';
import { useSTGDepositForm } from './form-context';

const trackTokenSelect = (value: TOKEN_DISPLAY_NAMES) => {
  switch (value) {
    case 'ETH':
      trackMatomoEvent(MATOMO_EARN_EVENTS_TYPES.strategySelectTokenEth);
      break;
    case 'wETH':
      trackMatomoEvent(MATOMO_EARN_EVENTS_TYPES.strategySelectTokenWeth);
      break;
    case 'wstETH':
      trackMatomoEvent(MATOMO_EARN_EVENTS_TYPES.strategySelectTokenWsteth);
      break;
    default:
      break;
  }
};

const OPTIONS = STG_DEPOSABLE_TOKENS.map((token) => ({ token }));

export const STGDepositInputGroup = () => {
  const token = useWatch<STGDepositFormValues, 'token'>({ name: 'token' });
  const { maxAmount } = useSTGDepositForm();
  const { isAA, isLoading: isLoadingAA } = useAA();
  const { data: gasLimit, isLoading: isLoadingGasLimit } =
    useSTGDepositEthGasLimit(token);

  // for ETH:
  // - leaves out 0.01
  // - leaves out gas price for non-AA
  // - blocks out max button until those are resolved/loaded
  const paddedETHMaxAmount = useTokenMaxAmount({
    balance: maxAmount,
    gasLimit,
    padding: BALANCE_PADDING,
    isPadded: !isAA,
    isLoading: isLoadingAA || isLoadingGasLimit,
  });

  const maxTokenAmount = token === 'ETH' ? paddedETHMaxAmount : maxAmount;

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
        data-testid="stg-deposit-input"
        maxValue={maxTokenAmount}
        showErrorMessage={false}
        onMaxClick={() => {
          trackMatomoEvent(MATOMO_EARN_EVENTS_TYPES.strategyDepositMax);
        }}
      />
    </InputGroupHookForm>
  );
};
