import { useFormState } from 'react-hook-form';

import { TokenDvstethIcon } from 'assets/earn';
import { TokenAmountInputHookForm } from 'shared/hook-form/controls/token-amount-input-hook-form';
import { useDVVPosition } from '../hooks/use-dvv-position';

export const DVVWithdrawInput = () => {
  const { disabled } = useFormState();
  const { data } = useDVVPosition();

  return (
    <TokenAmountInputHookForm
      leftDecorator={
        <TokenDvstethIcon width={24} height={24} viewBox={'0 0 28 28'} />
      }
      disabled={disabled}
      fieldName="amount"
      token={'dvstETH'}
      data-testid="dvv-withdraw-input"
      maxValue={data?.sharesBalance}
    />
  );
};
