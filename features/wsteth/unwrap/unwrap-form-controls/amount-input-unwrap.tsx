import { Wsteth } from '@lidofinance/lido-ui';
import { TOKENS } from '@lido-sdk/constants';
import { useWeb3 } from 'reef-knot/web3-react';

import { TokenAmountInputHookForm } from 'shared/hook-form/controls/token-amount-input-hook-form';
import { useUnwrapFormData } from '../unwrap-form-context';

export const TokenAmountInputUnwrap = () => {
  const { active } = useWeb3();
  const { maxAmount } = useUnwrapFormData();

  return (
    <TokenAmountInputHookForm
      disabled={!active}
      fieldName="amount"
      token={TOKENS.WSTETH}
      data-testid="unwrapInput"
      maxValue={maxAmount}
      leftDecorator={<Wsteth />}
    />
  );
};
