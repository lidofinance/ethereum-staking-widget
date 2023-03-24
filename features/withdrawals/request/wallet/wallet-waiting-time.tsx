import { Question, Tooltip } from '@lidofinance/lido-ui';

import { CardBalance } from 'shared/wallet';
import { Status } from 'features/withdrawals/shared';
import { useWithdrawals, useRequestData } from 'features/withdrawals/hooks';
import { formatEther } from '@ethersproject/units';

export const WalletWaitingTime = () => {
  const { withdrawalsStatus, isBunkerMode } = useWithdrawals();
  const { unfinalizedRequests } = useRequestData();
  const { unfinalizedStETH } = useRequestData();
  const requestsCount = unfinalizedRequests.data?.toNumber();

  const contentValue = isBunkerMode ? 'From 18 days' : '1 - 5 day(s)';
  const content = <Status variant={withdrawalsStatus}>{contentValue}</Status>;

  const tooltipTitle = (
    <>
      Waiting time depends on amount of stETH in withdraw and amount of
      requests.
      {unfinalizedStETH.data && (
        <>
          <br />
          Current amount of stETH: {formatEther(unfinalizedStETH.data)}
        </>
      )}
      {requestsCount !== undefined && (
        <>
          <br />
          Current amount of requests: {requestsCount}
        </>
      )}
    </>
  );

  const timeTitle = (
    <>
      Waiting time{' '}
      {
        <Tooltip placement="bottom" title={tooltipTitle}>
          <Question />
        </Tooltip>
      }
    </>
  );

  const isLoading =
    unfinalizedRequests.initialLoading || unfinalizedStETH.initialLoading;

  return (
    <CardBalance small title={timeTitle} loading={isLoading} value={content} />
  );
};
