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
        // TODO: 28px, but 24px in design
        leftDecorator={<TokenGGIcon />}
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
