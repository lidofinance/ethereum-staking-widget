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
import { useDappStatus } from 'modules/web3';

export const TokenAmountInputRequest = () => {
  const { isWalletConnected, isDappActive } = useDappStatus();
  const token = useWatch<RequestFormInputType, 'token'>({ name: 'token' });
  const { maxAmount, isTokenLocked } = useRequestFormData();

  const { balanceDiff } = useTvlMessage();

  return (
    <TokenAmountInputHookForm
      disabled={isWalletConnected && !isDappActive}
      fieldName="amount"
      data-testid="requestInput"
      token={token}
      isLocked={isTokenLocked}
      maxValue={maxAmount}
      onMaxClick={() => {
        trackMatomoEvent(MATOMO_CLICK_EVENTS_TYPES.withdrawalMaxInput);
      }}
      rightDecorator={
        balanceDiff && balanceDiff !== BigInt(0) ? (
          <InputDecoratorTvlStake tvlDiff={balanceDiff} />
        ) : null
      }
      showErrorMessage={false}
    />
  );
};
