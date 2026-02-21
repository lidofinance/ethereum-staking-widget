import { useFormState, useWatch } from 'react-hook-form';

import { BALANCE_PADDING, useAA } from 'modules/web3';
import { InputGroupHookForm } from 'shared/hook-form/controls/input-group-hook-form';
import { TokenAmountInputHookForm } from 'shared/hook-form/controls/token-amount-input-hook-form';
import { TokenSelectHookForm } from 'shared/hook-form/controls/token-select-hook-form/token-select-hook-form';
import { useTokenMaxAmount } from 'shared/hooks/use-token-max-amount';
import { TOKEN_DISPLAY_NAMES } from 'utils/getTokenDisplayName';

import { ETH_VAULT_DEPOSIT_TOKENS_MAIN } from '../consts';
import { ETHDepositFormValues } from './form-context/types';
import { useETHDepositEthGasLimit } from './hooks/use-deposit-eth-gas-limit';
import { useETHDepositForm } from './form-context';

const trackTokenSelect = (_value: TOKEN_DISPLAY_NAMES) => {
  // TODO: add matomo events
  // switch (value) {
  //   case 'ETH':
  //     trackMatomoEvent(MATOMO_EARN_EVENTS_TYPES.ethVaultSelectTokenEth);
  //     break;
  //   case 'wETH':
  //     trackMatomoEvent(MATOMO_EARN_EVENTS_TYPES.ethVaultSelectTokenWeth);
  //     break;
  //   case 'wstETH':
  //     trackMatomoEvent(MATOMO_EARN_EVENTS_TYPES.ethVaultSelectTokenWsteth);
  //     break;
  //   default:
  //     break;
  // }
};

const OPTIONS = ETH_VAULT_DEPOSIT_TOKENS_MAIN.map((token) => ({ token }));

export const EthVaultDepositInputGroup = () => {
  const token = useWatch<ETHDepositFormValues, 'token'>({ name: 'token' });
  const { maxAmount } = useETHDepositForm();
  const { isAA, isLoading: isLoadingAA } = useAA();
  const { data: gasLimit, isLoading: isLoadingGasLimit } =
    useETHDepositEthGasLimit(token);

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
        data-testid="ETH-vault-deposit-input"
        maxValue={maxTokenAmount}
        showErrorMessage={false}
        onMaxClick={() => {
          // trackMatomoEvent(MATOMO_EARN_EVENTS_TYPES.ethVaultDepositMax); // TODO: add matomo event for ETH vault max click
        }}
      />
    </InputGroupHookForm>
  );
};
