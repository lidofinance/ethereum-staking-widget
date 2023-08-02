import { TOKENS } from '@lido-sdk/constants';
import { InputDecoratorTvlStake } from 'features/withdrawals/shared/input-decorator-tvl-stake';
import { useController, useWatch } from 'react-hook-form';
import { InputAmount } from 'shared/forms/components/input-amount';
import { getTokenDisplayName } from 'utils/getTokenDisplayName';

import {
  RequestFormInputType,
  useRequestFormData,
} from 'features/withdrawals/request/request-form-context';
import { useTvlMessage } from 'features/withdrawals/hooks/useTvlMessage';

export const AmountInput = () => {
  const { balanceSteth, balanceWSteth, isTokenLocked } = useRequestFormData();
  const token = useWatch<RequestFormInputType, 'token'>({ name: 'token' });

  const {
    field,
    fieldState: { error },
  } = useController<RequestFormInputType, 'amount'>({
    name: 'amount',
  });

  const { balanceDiff } = useTvlMessage(error);

  const balance = token === TOKENS.STETH ? balanceSteth : balanceWSteth;

  return (
    <InputAmount
      fullwidth
      error={error?.type === 'validate'}
      placeholder="0"
      isLocked={isTokenLocked}
      maxValue={balance}
      rightDecorator={
        balanceDiff && <InputDecoratorTvlStake tvlDiff={balanceDiff} />
      }
      label={`${getTokenDisplayName(token)} amount`}
      {...field}
    />
  );
};
