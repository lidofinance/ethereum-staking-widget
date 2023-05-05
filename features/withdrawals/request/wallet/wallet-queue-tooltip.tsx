import { Question, Tooltip } from '@lidofinance/lido-ui';
import Link from 'next/link';

import { FormatToken } from 'shared/formatters';
import { useRequestData } from 'features/withdrawals/contexts/request-data-context';
import { useWaitingTime } from 'features/withdrawals/hooks';

import { QueuInfoStyled, DataTableRowStyled } from './styles';

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
      in queue and <Link href="#withdrawalsPeriod">other reasons</Link>.
      {queueInfo}
    </>
  );

  return (
    <Tooltip placement="bottom" title={tooltipTitle}>
      <Question />
    </Tooltip>
  );
};
