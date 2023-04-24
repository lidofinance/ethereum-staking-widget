import { CardBalance } from 'shared/wallet';
import { Status } from 'features/withdrawals/shared';
import { useWithdrawals, useRequestData } from 'features/withdrawals/hooks';

import { WalletQueueTooltip } from './wallet-queue-tooltip';

// this is used in other places
// TODO move this hook when refactoring to better time estimation
export const useWaitingTime = () => {
  const { isBunkerMode, isPaused } = useWithdrawals();
  const { unfinalizedStETH } = useRequestData();
  const isLoading = unfinalizedStETH.initialLoading;
  const contentValue = isPaused
    ? '—'
    : isBunkerMode
    ? 'Not estimated'
    : '1 - 5 day(s)';
  return { value: contentValue, isLoading };
};

export const WalletWaitingTime = () => {
  const { withdrawalsStatus } = useWithdrawals();
  const { value, isLoading } = useWaitingTime();

  const content = <Status variant={withdrawalsStatus}>{value}</Status>;
  const timeTitle = <>Waiting time {<WalletQueueTooltip />}</>;

  return (
    <CardBalance small title={timeTitle} loading={isLoading} value={content} />
  );
};
