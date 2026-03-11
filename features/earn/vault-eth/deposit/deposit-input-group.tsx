import { useFormState, useWatch } from 'react-hook-form';

import { BALANCE_PADDING, useAA } from 'modules/web3';
import { InputGroupHookForm } from 'shared/hook-form/controls/input-group-hook-form';
import { TokenAmountInputHookForm } from 'shared/hook-form/controls/token-amount-input-hook-form';
import { TokenSelectHookForm } from 'shared/hook-form/controls/token-select-hook-form/token-select-hook-form';
import { useTokenMaxAmount } from 'shared/hooks/use-token-max-amount';
import { trackMatomoEvent } from 'utils/track-matomo-event';
import { MATOMO_EARN_EVENTS_TYPES } from 'consts/matomo';
import { TOKEN_SYMBOLS, TOKENS } from 'consts/tokens';

import { ETH_VAULT_DEPOSIT_TOKENS_FORM } from '../consts';
import { ETHDepositFormValues } from './form-context/types';
import { useETHDepositEthGasLimit } from './hooks/use-deposit-eth-gas-limit';
import { useETHDepositForm } from './form-context';
import { EthDepositTokenForm } from '../types';
import { asEthDepositToken } from '../utils';

const trackTokenSelect = (value: string) => {
  const token = value.toLowerCase() as EthDepositTokenForm;
  switch (token) {
    case TOKENS.eth:
      trackMatomoEvent(MATOMO_EARN_EVENTS_TYPES.earnEthSelectTokenEth);
      break;
    case TOKENS.weth:
      trackMatomoEvent(MATOMO_EARN_EVENTS_TYPES.earnEthSelectTokenWeth);
      break;
    case TOKENS.wsteth:
      trackMatomoEvent(MATOMO_EARN_EVENTS_TYPES.earnEthSelectTokenWsteth);
      break;
    default:
      break;
  }
};

const OPTIONS = ETH_VAULT_DEPOSIT_TOKENS_FORM.map((token) => ({
  token: TOKEN_SYMBOLS[token],
}));

export const EthVaultDepositInputGroup = () => {
  const tokenSymbol = useWatch<ETHDepositFormValues, 'token'>({
    name: 'token',
  });
  const { maxAmount } = useETHDepositForm();
  const { isAA, isLoading: isLoadingAA } = useAA();
  const { data: gasLimit, isLoading: isLoadingGasLimit } =
    useETHDepositEthGasLimit(asEthDepositToken(tokenSymbol));

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

  const maxTokenAmount =
    asEthDepositToken(tokenSymbol) === TOKENS.eth
      ? paddedETHMaxAmount
      : maxAmount;

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
        data-testid="ETH-vault-deposit-input"
        maxValue={maxTokenAmount}
        showErrorMessage={false}
        onMaxClick={() => {
          trackMatomoEvent(MATOMO_EARN_EVENTS_TYPES.earnEthDepositMax);
        }}
      />
    </InputGroupHookForm>
  );
};
