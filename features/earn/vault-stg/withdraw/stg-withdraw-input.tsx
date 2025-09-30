import { useFormState } from 'react-hook-form';

import { InputGroupHookForm } from 'shared/hook-form/controls/input-group-hook-form';
import { TokenAmountInputHookForm } from 'shared/hook-form/controls/token-amount-input-hook-form';
import { TokenStrethIcon } from 'assets/earn';

import { useSTGWithdrawForm } from './form-context';

export const STGWithdrawInput: React.FC = () => {
  const { maxAmount } = useSTGWithdrawForm();
  const { disabled } = useFormState();

  return (
    <InputGroupHookForm errorField="amount" bottomSpacing={false}>
      <TokenAmountInputHookForm
        leftDecorator={<TokenStrethIcon width={24} height={24} />}
        disabled={disabled}
        fieldName="amount"
        token={'strETH'}
        data-testid="stg-withdraw-input"
        maxValue={maxAmount}
        showErrorMessage={false}
      />
    </InputGroupHookForm>
  );
};
