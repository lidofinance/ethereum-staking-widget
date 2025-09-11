import { useFormState, useWatch } from 'react-hook-form';
import { InputGroupHookForm } from 'shared/hook-form/controls/input-group-hook-form';
import { TokenAmountInputHookForm } from 'shared/hook-form/controls/token-amount-input-hook-form';
import { TokenSelectHookForm } from 'shared/hook-form/controls/token-select-hook-form/token-select-hook-form';

import { STG_DEPOSABLE_TOKENS } from '../consts';
import { STGDepositFormValues } from './form-context/types';

export const STGDepositInputGroup = () => {
  const token = useWatch<STGDepositFormValues, 'token'>({ name: 'token' });
  const { disabled } = useFormState();

  const OPTIONS = STG_DEPOSABLE_TOKENS.map((token) => ({ token }));

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
        maxValue={0n}
        showErrorMessage={false}
      />
    </InputGroupHookForm>
  );
};
