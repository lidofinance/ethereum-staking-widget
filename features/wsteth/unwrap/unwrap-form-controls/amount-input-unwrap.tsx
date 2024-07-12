import { Wsteth } from '@lidofinance/lido-ui';
import { TOKENS } from '@lido-sdk/constants';

import { TokenAmountInputHookForm } from 'shared/hook-form/controls/token-amount-input-hook-form';
import { useConnectionStatuses } from 'shared/hooks/use-connection-statuses';

import { useUnwrapFormData } from '../unwrap-form-context';

export const TokenAmountInputUnwrap = () => {
  const { isDappActive } = useConnectionStatuses();
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
