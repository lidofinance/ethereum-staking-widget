import { Question, Tooltip } from '@lidofinance/lido-ui';

import { CardBalance } from 'shared/wallet';
import { DATA_UNAVAILABLE } from 'config';
import { Status } from 'features/withdrawals/shared';
import { useWithdrawals, useRequestData } from 'features/withdrawals/hooks';

export const WalletQueueRequests = () => {
  const { withdrawalsStatus } = useWithdrawals();
  const { unfinalizedRequests } = useRequestData();
  const requestsCount = unfinalizedRequests.data?.toNumber();

  const requestsValue = requestsCount ?? DATA_UNAVAILABLE;
  const requestsContent = (
    <Status variant={withdrawalsStatus}>{requestsValue}</Status>
  );

  const requestsTitle = (
    <>
      Unstake requests{' '}
      {
        <Tooltip
          placement="bottom"
          title={`This represents total amount of active unstake requests from users. 
          Please note that default stETH unstaking period take from 1 day to process one request.`}
        >
          <Question />
        </Tooltip>
      }
    </>
  );

  return (
    <CardBalance
      small
      title={requestsTitle}
      loading={unfinalizedRequests.initialLoading}
      value={requestsContent}
    />
  );
};
