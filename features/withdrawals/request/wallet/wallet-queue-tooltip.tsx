import { Question, Tooltip } from '@lidofinance/lido-ui';
import Link from 'next/link';

import { FormatToken } from 'shared/formatters';
import { useWaitingTime } from 'features/withdrawals/hooks';

import {
  trackMatomoEvent,
  MATOMO_CLICK_EVENTS_TYPES,
} from 'config/trackMatomoEvent';
import { QueueInfoStyled, DataTableRowStyled } from './styles';
import { useRequestFormData } from '../request-form-context';

export const WalletQueueTooltip = () => {
  const waitingTime = useWaitingTime('');
  const { unfinalizedStETH } = useRequestFormData();

  const queueInfo = (
    <QueueInfoStyled>
      <DataTableRowStyled
        data-testid="modeTooltipAmount"
        title="Amount"
        loading={!unfinalizedStETH}
      >
        <FormatToken amount={unfinalizedStETH} symbol="stETH" />
      </DataTableRowStyled>
      <DataTableRowStyled
        title="Waiting time"
        data-testid="modeTooltipWaitingTime"
        loading={waitingTime.initialLoading}
      >
        {waitingTime.value}
      </DataTableRowStyled>
    </QueueInfoStyled>
  );

  const tooltipTitle = (
    <>
      The withdrawal request time depends on the mode, overall amount of stETH
      in queue and{' '}
      <Link href="#withdrawalsPeriod">
        <a
          aria-hidden="true"
          data-testid="otherFactorsLink"
          onClick={() =>
            trackMatomoEvent(
              MATOMO_CLICK_EVENTS_TYPES.withdrawalOtherFactorsTooltipMode,
            )
          }
        >
          other factors
        </a>
      </Link>
      .{queueInfo}
    </>
  );

  return (
    <Tooltip placement="bottom" title={tooltipTitle}>
      <Question />
    </Tooltip>
  );
};
