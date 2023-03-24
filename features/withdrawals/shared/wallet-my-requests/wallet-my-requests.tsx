import { Tooltip, TimeSquare, TickSquare } from '@lidofinance/lido-ui';
import { FC } from 'react';

import { CardBalance } from 'shared/wallet';
import { DATA_UNAVAILABLE } from 'config';

import { RequestCounterStyled } from './styles';
import { useClaimData } from 'features/withdrawals/hooks';

export const WalletMyRequests: FC = ({ children }) => {
  const { withdrawalRequestsData } = useClaimData();
  const { readyCount, pendingCount } = withdrawalRequestsData.data || {};
  const readyValue = readyCount ?? DATA_UNAVAILABLE;
  const pendingValue = pendingCount ?? DATA_UNAVAILABLE;

  const title = <>My requests {children}</>;

  const requestsContent = (
    <>
      <RequestCounterStyled>
        <Tooltip placement="bottom" title="Ready to claim">
          <span>
            <TickSquare />
            <span>{readyValue}</span>
          </span>
        </Tooltip>
      </RequestCounterStyled>

      <RequestCounterStyled>
        <Tooltip placement="bottom" title="On pending">
          <span>
            <TimeSquare />
            <span>{pendingValue}</span>
          </span>
        </Tooltip>
      </RequestCounterStyled>
    </>
  );

  return (
    <CardBalance
      small
      title={title}
      loading={withdrawalRequestsData.loading}
      value={requestsContent}
    />
  );
};
