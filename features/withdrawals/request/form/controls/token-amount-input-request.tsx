import { InputDecoratorTvlStake } from 'features/withdrawals/shared/input-decorator-tvl-stake';
import { useController } from 'react-hook-form';

import {
  RequestFormInputType,
  useRequestFormData,
} from 'features/withdrawals/request/request-form-context';
import { useTvlMessage } from 'features/withdrawals/hooks/useTvlMessage';
import { TokenAmountInputHookForm } from 'shared/hook-form/controls/token-amount-input-hook-form';

export const TokenAmountInputRequest = () => {
  const { maxAmount, isTokenLocked } = useRequestFormData();

  const {
    fieldState: { error },
  } = useController<RequestFormInputType, 'amount'>({
    name: 'amount',
  });

  const { balanceDiff } = useTvlMessage(error);

  return (
    <TokenAmountInputHookForm
      isLocked={isTokenLocked}
      maxValue={maxAmount}
      rightDecorator={
        balanceDiff && <InputDecoratorTvlStake tvlDiff={balanceDiff} />
      }
    />
  );
};
