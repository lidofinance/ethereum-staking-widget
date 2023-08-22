import { InputDecoratorTvlStake } from 'features/withdrawals/shared/input-decorator-tvl-stake';
import { useController, useWatch } from 'react-hook-form';
import { InputAmount } from 'shared/forms/components/input-amount';
import { getTokenDisplayName } from 'utils/getTokenDisplayName';

import {
  RequestFormInputType,
  useRequestFormData,
} from 'features/withdrawals/request/request-form-context';
import { useTvlMessage } from 'features/withdrawals/hooks/useTvlMessage';
import { isValidationErrorTypeDefault } from 'shared/hook-form/validation-error';

export const AmountInput = () => {
  const { maxAmount, isTokenLocked } = useRequestFormData();
  const token = useWatch<RequestFormInputType, 'token'>({ name: 'token' });

  const {
    field,
    fieldState: { error },
  } = useController<RequestFormInputType, 'amount'>({
    name: 'amount',
  });

  const { balanceDiff } = useTvlMessage(error);

  return (
    <InputAmount
      fullwidth
      error={isValidationErrorTypeDefault(error?.type)}
      isLocked={isTokenLocked}
      maxValue={maxAmount}
      rightDecorator={
        balanceDiff && <InputDecoratorTvlStake tvlDiff={balanceDiff} />
      }
      label={`${getTokenDisplayName(token)} amount`}
      {...field}
    />
  );
};
