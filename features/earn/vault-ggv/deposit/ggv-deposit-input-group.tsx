import { useFormState, useWatch } from 'react-hook-form';

import { BALANCE_PADDING, useAA } from 'modules/web3';

import { useTokenMaxAmount } from 'shared/hooks/use-token-max-amount';
import { InputGroupHookForm } from 'shared/hook-form/controls/input-group-hook-form';
import { TokenSelectHookForm } from 'shared/hook-form/controls/token-select-hook-form/token-select-hook-form';
import { TokenAmountInputHookForm } from 'shared/hook-form/controls/token-amount-input-hook-form';
import { TOKEN_DISPLAY_NAMES } from 'utils/getTokenDisplayName';
import { trackMatomoEvent } from 'utils/track-matomo-event';
import { MATOMO_EARN_EVENTS_TYPES } from 'consts/matomo';

import type { GGVDepositFormValues } from './form-context/types';
import { GGV_DEPOSABLE_TOKENS } from '../consts';
import { useGGVDepositForm } from './form-context';
import { useGGVDepositEthGasLimit } from './hooks/use-ggv-deposit-eth-gas-limit';

const trackTokenSelect = (value: TOKEN_DISPLAY_NAMES) => {
  switch (value) {
    case 'ETH':
      trackMatomoEvent(MATOMO_EARN_EVENTS_TYPES.ggvSelectTokenEth);
      break;
    case 'wETH':
      trackMatomoEvent(MATOMO_EARN_EVENTS_TYPES.ggvSelectTokenWeth);
      break;
    case 'stETH':
      trackMatomoEvent(MATOMO_EARN_EVENTS_TYPES.ggvSelectTokenSteth);
      break;
    case 'wstETH':
      trackMatomoEvent(MATOMO_EARN_EVENTS_TYPES.ggvSelectTokenWsteth);
      break;
    default:
      break;
  }
};

const OPTIONS = GGV_DEPOSABLE_TOKENS.map((token) => ({ token }));

export const GGVDepositInputGroup: React.FC = () => {
  const token = useWatch<GGVDepositFormValues, 'token'>({ name: 'token' });
  const { maxAmount } = useGGVDepositForm();
  const { isAA, isLoading: isLoadingAA } = useAA();
  const { data: gasLimit, isLoading: isLoadingGasLimit } =
    useGGVDepositEthGasLimit();

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
        data-testid="ggv-deposit-input"
        maxValue={maxTokenAmount}
        showErrorMessage={false}
        onMaxClick={() => {
          trackMatomoEvent(MATOMO_EARN_EVENTS_TYPES.ggvDepositInputMaxClick);
        }}
      />
    </InputGroupHookForm>
  );
};
