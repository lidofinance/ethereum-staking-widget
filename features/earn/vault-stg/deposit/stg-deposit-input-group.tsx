import { useFormState, useWatch } from 'react-hook-form';

import { BALANCE_PADDING, useAA } from 'modules/web3';
import { InputGroupHookForm } from 'shared/hook-form/controls/input-group-hook-form';
import { TokenAmountInputHookForm } from 'shared/hook-form/controls/token-amount-input-hook-form';
import { TokenSelectHookForm } from 'shared/hook-form/controls/token-select-hook-form/token-select-hook-form';
import { useTokenMaxAmount } from 'shared/hooks/use-token-max-amount';

import { STG_DEPOSABLE_TOKENS } from '../consts';
import { STGDepositFormValues } from './form-context/types';
import { useSTGDepositEthGasLimit } from './hooks/use-stg-deposit-eth-gas-limit';
import { useSTGDepositForm } from './form-context';

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
      />
      <TokenAmountInputHookForm
        disabled={disabled}
        fieldName="amount"
        token={token}
        data-testid="stg-deposit-input"
        maxValue={maxTokenAmount}
        showErrorMessage={false}
      />
    </InputGroupHookForm>
  );
};
