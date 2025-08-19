import { useFormState } from 'react-hook-form';

import { TokenDvstethIcon } from 'assets/earn';
import { TokenAmountInputHookForm } from 'shared/hook-form/controls/token-amount-input-hook-form';
import { useDVVPosition } from '../hooks/use-dvv-position';

export const DVVWithdrawInput = () => {
  const { disabled } = useFormState();
  const { data } = useDVVPosition();

  return (
    <TokenAmountInputHookForm
      // TODO: 28px, but 24px in design
      leftDecorator={<TokenDvstethIcon />}
      disabled={disabled}
      fieldName="amount"
      token={'dvstETH'}
      data-testid="dvv-withdraw-input"
      maxValue={data?.sharesBalance}
    />
  );
};
