import { useFormState, useWatch } from 'react-hook-form';

import { BALANCE_PADDING, useAA } from 'modules/web3';

import { useTokenMaxAmount } from 'shared/hooks/use-token-max-amount';
import { InputGroupHookForm } from 'shared/hook-form/controls/input-group-hook-form';
import { TokenSelectHookForm } from 'shared/hook-form/controls/token-select-hook-form/token-select-hook-form';
import { TokenAmountInputHookForm } from 'shared/hook-form/controls/token-amount-input-hook-form';

import type { DVVDepositFormValues } from './types';
import { useDVVDepositForm } from './form-context';
import { DVV_DEPOSABLE_TOKENS } from '../consts';
import { useDVVDepositEthGasLimit } from './hooks/use-dvv-deposit-eth-gas-limit';

const OPTIONS = DVV_DEPOSABLE_TOKENS.map((token) => ({ token }));

export const DVVDepositInputGroup: React.FC = () => {
  const token = useWatch<DVVDepositFormValues, 'token'>({ name: 'token' });
  const { maxAmount } = useDVVDepositForm();
  const { isAA, isLoading: isLoadingAA } = useAA();
  const { data: gasLimit, isLoading: isLoadingGasLimit } =
    useDVVDepositEthGasLimit();

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
      />
      <TokenAmountInputHookForm
        disabled={disabled}
        fieldName="amount"
        token={token}
        data-testid="ggv-deposit-input"
        maxValue={maxTokenAmount}
        showErrorMessage={false}
      />
    </InputGroupHookForm>
  );
};
