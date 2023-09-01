import { useUnwrapFormData } from '../unwrap-form-context';

import { Wsteth } from '@lidofinance/lido-ui';
import { TokenAmountInputHookForm } from 'shared/hook-form/controls/token-amount-input-hook-form';
import { TOKENS } from '@lido-sdk/constants';

export const TokenAmountInputUnwrap = () => {
  const { maxAmount } = useUnwrapFormData();

  return (
    <TokenAmountInputHookForm
      fieldName="amount"
      token={TOKENS.WSTETH}
      data-testid="unwrapInput"
      maxValue={maxAmount}
      leftDecorator={<Wsteth />}
    />
  );
};
