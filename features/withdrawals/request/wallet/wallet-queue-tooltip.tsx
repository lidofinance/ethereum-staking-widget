import { Question, Tooltip } from '@lidofinance/lido-ui';

import { FormatToken } from 'shared/formatters';
import { useRequestData } from 'features/withdrawals/contexts/request-data-context';
import { useWaitingTime } from 'features/withdrawals/hooks';

import {
  trackMatomoEvent,
  MATOMO_CLICK_EVENTS_TYPES,
} from 'config/trackMatomoEvent';
import { QueuInfoStyled, DataTableRowStyled } from './styles';
import { LocalLink } from 'shared/components/local-link';

export const WalletQueueTooltip = () => {
  const waitingTime = useWaitingTime('');
  const { unfinalizedStETH } = useRequestData();

  const queueInfo = unfinalizedStETH.data && (
    <QueuInfoStyled>
      <DataTableRowStyled
        title="Amount"
        loading={unfinalizedStETH.initialLoading}
      >
        <FormatToken amount={unfinalizedStETH.data} symbol="stETH" />
      </DataTableRowStyled>
      <DataTableRowStyled
        title="Waiting time"
        loading={waitingTime.initialLoading}
      >
        {waitingTime.value}
      </DataTableRowStyled>
    </QueuInfoStyled>
  );

  const tooltipTitle = (
    <>
      The withdrawal request time depends on the mode, overall amount of stETH
      in queue and{' '}
      <LocalLink href="#withdrawalsPeriod">
        <a
          aria-hidden="true"
          onClick={() =>
            trackMatomoEvent(
              MATOMO_CLICK_EVENTS_TYPES.withdrawalOtherFactorsTooltipMode,
            )
          }
        >
          other factors
        </a>
      </LocalLink>
      .{queueInfo}
    </>
  );

  return (
    <Tooltip placement="bottom" title={tooltipTitle}>
      <Question />
    </Tooltip>
  );
};
