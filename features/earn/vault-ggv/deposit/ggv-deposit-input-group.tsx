import { useFormState, useWatch } from 'react-hook-form';

import { InputGroupHookForm } from 'shared/hook-form/controls/input-group-hook-form';
import { TokenSelectHookForm } from 'shared/hook-form/controls/token-select-hook-form/token-select-hook-form';
import { TokenAmountInputHookForm } from 'shared/hook-form/controls/token-amount-input-hook-form';

import type { GGVDepositFormValues } from './form-context/types';
import { GGV_DEPOSABLE_TOKENS } from '../consts';
import { useGGVDepositForm } from './form-context';

const OPTIONS = GGV_DEPOSABLE_TOKENS.map((token) => ({ token }));

export const GGVDepositInputGroup: React.FC = () => {
  const { maxAmount } = useGGVDepositForm();
  const { disabled } = useFormState();
  const token = useWatch<GGVDepositFormValues, 'token'>({ name: 'token' });

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
        maxValue={maxAmount}
        showErrorMessage={false}
      />
    </InputGroupHookForm>
  );
};
