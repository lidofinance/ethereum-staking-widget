import { Question, Tooltip } from '@lidofinance/lido-ui';

import { MATOMO_CLICK_EVENTS_TYPES } from 'consts/matomo';
import { useWaitingTime } from 'features/withdrawals/hooks';
import { OnlyIpfsRender } from 'shared/components/only-ipfs-render';
import { OnlyInfraRender } from 'shared/components/only-infra-render';
import { FormatToken } from 'shared/formatters';
import { useInpageNavigation } from 'providers/inpage-navigation';
import { trackMatomoEvent } from 'utils/track-matomo-event';

import { QueueInfoStyled, DataTableRowStyled } from './styles';
import { useRequestFormData } from '../request-form-context';

export const WalletQueueTooltip = () => {
  const waitingTime = useWaitingTime(null);
  const { unfinalizedStETH } = useRequestFormData();
  const { navigateInpageAnchor } = useInpageNavigation();

  const queueInfo = (
    <QueueInfoStyled>
      <DataTableRowStyled
        data-testid="modeTooltipAmount"
        title="Amount"
        loading={!unfinalizedStETH}
      >
        <FormatToken
          amount={unfinalizedStETH}
          symbol="stETH"
          showAmountTip={false}
        />
      </DataTableRowStyled>
      <DataTableRowStyled
        title="Waiting time"
        data-testid="modeTooltipWaitingTime"
        loading={waitingTime.isLoading}
      >
        {waitingTime.value}
      </DataTableRowStyled>
    </QueueInfoStyled>
  );

  const tooltipTitle = (
    <>
      The withdrawal request time depends on the mode, overall amount of stETH
      in queue and <OnlyIpfsRender>other factors</OnlyIpfsRender>
      <OnlyInfraRender>
        <a
          href="#withdrawalsPeriod"
          data-testid="otherFactorsLink"
          onClick={(e) => {
            trackMatomoEvent(
              MATOMO_CLICK_EVENTS_TYPES.withdrawalOtherFactorsTooltipMode,
            );
            navigateInpageAnchor(e);
          }}
        >
          other factors
        </a>
      </OnlyInfraRender>
      .{queueInfo}
    </>
  );

  return (
    <Tooltip placement="bottom" title={tooltipTitle}>
      <Question />
    </Tooltip>
  );
};
