import { Tooltip, TimeSquare, TickSquare } from '@lidofinance/lido-ui';
import { FC } from 'react';

import { CardBalance } from 'shared/wallet';
import { useClaimData } from 'features/withdrawals/contexts/claim-data-context';
import { DATA_UNAVAILABLE } from 'config';

import { RequestCounterStyled } from './styles';

export const WalletMyRequests: FC = ({ children }) => {
  const { withdrawalRequestsData, loading } = useClaimData();
  const { readyCount = DATA_UNAVAILABLE, pendingCount = DATA_UNAVAILABLE } =
    withdrawalRequestsData || {};

  const title = <>My requests {children}</>;

  const requestsContent = (
    <>
      <RequestCounterStyled>
        <Tooltip placement="bottom" title="Ready to claim">
          <span>
            <TickSquare />
            <span>{readyCount}</span>
          </span>
        </Tooltip>
      </RequestCounterStyled>

      <RequestCounterStyled>
        <Tooltip placement="bottom" title="Pending">
          <span>
            <TimeSquare />
            <span>{pendingCount}</span>
          </span>
        </Tooltip>
      </RequestCounterStyled>
    </>
  );

  return (
    <CardBalance
      small
      title={title}
      loading={loading}
      value={requestsContent}
    />
  );
};
