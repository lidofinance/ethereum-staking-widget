import { Question, Tooltip } from '@lidofinance/lido-ui';

import { FormatToken } from 'shared/formatters';
import { useRequestData } from 'features/withdrawals/hooks';

import { DataWrapperStyled, QueuInfoStyled } from './styles';

export const WalletQueueTooltip = () => {
  const { unfinalizedStETH, unfinalizedRequests } = useRequestData();
  const requestsCount = unfinalizedRequests.data?.toNumber();

  const stethInQueue = unfinalizedStETH.data && (
    <QueuInfoStyled>
      <div>The overall amount of stETH in queue: </div>
      <DataWrapperStyled>
        <FormatToken amount={unfinalizedStETH.data} symbol="" />
      </DataWrapperStyled>
    </QueuInfoStyled>
  );
  const requestsInQueue = requestsCount !== undefined && (
    <QueuInfoStyled>
      The overall amount of requests in queue:{' '}
      <DataWrapperStyled>{requestsCount}</DataWrapperStyled>
    </QueuInfoStyled>
  );

  const tooltipTitle = (
    <>
      Waiting time depends on amount of stETH in withdraw and amount of
      requests.
      {stethInQueue}
      {requestsInQueue}
    </>
  );

  return (
    <Tooltip placement="bottom" title={tooltipTitle}>
      <Question />
    </Tooltip>
  );
};
