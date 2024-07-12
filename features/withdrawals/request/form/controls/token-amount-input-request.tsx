import { useController, useWatch } from 'react-hook-form';

import { MATOMO_CLICK_EVENTS_TYPES } from 'consts/matomo-click-events';
import { InputDecoratorTvlStake } from 'features/withdrawals/shared/input-decorator-tvl-stake';
import {
  RequestFormInputType,
  useRequestFormData,
} from 'features/withdrawals/request/request-form-context';
import { useTvlMessage } from 'features/withdrawals/hooks/useTvlMessage';

import { trackMatomoEvent } from 'utils/track-matomo-event';
import { TokenAmountInputHookForm } from 'shared/hook-form/controls/token-amount-input-hook-form';
import { useConnectionStatuses } from 'shared/hooks/use-connection-statuses';

export const TokenAmountInputRequest = () => {
  const { isDappActive } = useConnectionStatuses();
  const token = useWatch<RequestFormInputType, 'token'>({ name: 'token' });
  const { maxAmount, isTokenLocked } = useRequestFormData();

  const {
    fieldState: { error },
  } = useController<RequestFormInputType, 'amount'>({
    name: 'amount',
  });

  const { balanceDiff } = useTvlMessage(error);

  return (
    <TokenAmountInputHookForm
      disabled={!isDappActive}
      fieldName="amount"
      data-testid="requestInput"
      token={token}
      isLocked={isTokenLocked}
      maxValue={maxAmount}
      onMaxClick={() => {
        trackMatomoEvent(MATOMO_CLICK_EVENTS_TYPES.withdrawalMaxInput);
      }}
      rightDecorator={
        balanceDiff && <InputDecoratorTvlStake tvlDiff={balanceDiff} />
      }
      showErrorMessage={false}
    />
  );
};
