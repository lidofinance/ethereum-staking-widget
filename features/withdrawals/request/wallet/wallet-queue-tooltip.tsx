import { Question, Tooltip } from '@lidofinance/lido-ui';

import { FormatToken } from 'shared/formatters';
import { useRequestData } from 'features/withdrawals/contexts/request-data-context';

import { DataWrapperStyled, QueuInfoStyled } from './styles';

export const WalletQueueTooltip = () => {
  const { unfinalizedStETH } = useRequestData();

  const stethInQueue = unfinalizedStETH.data && (
    <QueuInfoStyled>
      <div>The overall amount of stETH in queue: </div>
      <DataWrapperStyled>
        <FormatToken amount={unfinalizedStETH.data} symbol="" />
      </DataWrapperStyled>
    </QueuInfoStyled>
  );

  const tooltipTitle = (
    <>
      Waiting time depends on amount of stETH in withdraw and amount of
      requests.
      {stethInQueue}
    </>
  );

  return (
    <Tooltip placement="bottom" title={tooltipTitle}>
      <Question />
    </Tooltip>
  );
};
