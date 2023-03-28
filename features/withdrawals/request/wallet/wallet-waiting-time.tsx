import { CardBalance } from 'shared/wallet';
import { Status } from 'features/withdrawals/shared';
import { useWithdrawals, useRequestData } from 'features/withdrawals/hooks';

import { WalletQueueTooltip } from './wallet-queue-tooltip';

export const WalletWaitingTime = () => {
  const { withdrawalsStatus, isBunkerMode } = useWithdrawals();
  const { unfinalizedStETH, unfinalizedRequests } = useRequestData();

  const contentValue = isBunkerMode ? 'Not estimated' : '1 - 5 day(s)';
  const content = <Status variant={withdrawalsStatus}>{contentValue}</Status>;

  const isLoading =
    unfinalizedRequests.initialLoading || unfinalizedStETH.initialLoading;

  const timeTitle = <>Waiting time {<WalletQueueTooltip />}</>;

  return (
    <CardBalance small title={timeTitle} loading={isLoading} value={content} />
  );
};
