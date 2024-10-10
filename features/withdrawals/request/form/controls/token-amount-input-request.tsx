import { useWatch } from 'react-hook-form';

import { MATOMO_CLICK_EVENTS_TYPES } from 'consts/matomo-click-events';
import { InputDecoratorTvlStake } from 'features/withdrawals/shared/input-decorator-tvl-stake';
import {
  RequestFormInputType,
  useRequestFormData,
} from 'features/withdrawals/request/request-form-context';
import { useTvlMessage } from 'features/withdrawals/hooks/useTvlMessage';

import { trackMatomoEvent } from 'utils/track-matomo-event';
import { TokenAmountInputHookForm } from 'shared/hook-form/controls/token-amount-input-hook-form';
import { useDappStatus } from 'shared/hooks/use-dapp-status';

export const TokenAmountInputRequest = () => {
  const { isWalletConnected, isDappActive, isAccountActiveOnL2 } =
    useDappStatus();
  const token = useWatch<RequestFormInputType, 'token'>({ name: 'token' });
  const { maxAmount, isTokenLocked } = useRequestFormData();

  const { balanceDiff } = useTvlMessage();

  return (
    <TokenAmountInputHookForm
      disabled={(isWalletConnected && !isDappActive) || isAccountActiveOnL2}
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
