import { Wsteth } from '@lidofinance/lido-ui';
import { TOKENS } from '@lido-sdk/constants';

import { TokenAmountInputHookForm } from 'shared/hook-form/controls/token-amount-input-hook-form';
import { useDappStatuses } from 'shared/hooks/use-dapp-statuses';

import { useUnwrapFormData } from '../unwrap-form-context';

export const TokenAmountInputUnwrap = () => {
  const { isDappActive } = useDappStatuses();
  const { maxAmount } = useUnwrapFormData();

  return (
    <TokenAmountInputHookForm
      disabled={!isDappActive}
      fieldName="amount"
      token={TOKENS.WSTETH}
      data-testid="unwrapInput"
      maxValue={maxAmount}
      leftDecorator={<Wsteth />}
    />
  );
};
