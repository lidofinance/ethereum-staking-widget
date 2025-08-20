import { useFormState } from 'react-hook-form';

import { TokenGGIcon } from 'assets/earn';
import { TokenAmountInputHookForm } from 'shared/hook-form/controls/token-amount-input-hook-form';
import { useGGVPosition } from '../hooks/use-ggv-position';
import { InputGroupHookForm } from 'shared/hook-form/controls/input-group-hook-form';

export const GGVWithdrawInput = () => {
  const { data } = useGGVPosition();
  const { disabled } = useFormState();

  return (
    <InputGroupHookForm errorField="amount" bottomSpacing={false}>
      <TokenAmountInputHookForm
        leftDecorator={
          <TokenGGIcon width={24} height={24} viewBox={'0 0 28 28'} />
        }
        disabled={disabled}
        fieldName="amount"
        token={'gg'}
        data-testid="ggv-withdraw-input"
        maxValue={data?.sharesBalance}
        showErrorMessage={false}
      />
    </InputGroupHookForm>
  );
};
