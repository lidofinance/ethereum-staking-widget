import { CardBalance } from 'shared/wallet';
import { Status } from 'features/withdrawals/shared';
import { useWaitingTime } from 'features/withdrawals/hooks';
import { useRequestForm } from 'features/withdrawals/contexts/request-form-context';
import { useRequestData } from 'features/withdrawals/contexts/request-data-context';
import { useWithdrawals } from 'features/withdrawals/contexts/withdrawals-context';

import { WalletQueueTooltip } from './wallet-queue-tooltip';

export const WalletWaitingTime = () => {
  const { withdrawalsStatus } = useWithdrawals();
  const { unfinalizedStETH } = useRequestData();
  const { inputValue } = useRequestForm();
  const waitingTime = useWaitingTime(inputValue);

  const content = (
    <Status variant={withdrawalsStatus}>{waitingTime.value}</Status>
  );

  const isLoading =
    unfinalizedStETH.initialLoading || waitingTime.initialLoading;

  const timeTitle = <>Waiting time {<WalletQueueTooltip />}</>;

  return (
    <CardBalance small title={timeTitle} loading={isLoading} value={content} />
  );
};
