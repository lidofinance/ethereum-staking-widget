import { useFormState } from 'react-hook-form';
import { TokenAmountInputHookForm } from 'shared/hook-form/controls/token-amount-input-hook-form';
import { useGGVPosition } from '../hooks/use-ggv-position';
import { TokenGGIcon } from 'assets/earn';

export const GGVWithdrawInput = () => {
  const { data } = useGGVPosition();
  const { disabled } = useFormState();

  return (
    <TokenAmountInputHookForm
      leftDecorator={<TokenGGIcon />}
      disabled={disabled}
      fieldName="amount"
      token={'gg'}
      data-testid="ggv-withdraw-input"
      maxValue={data?.sharesBalance}
    />
  );
};
