import { FC } from 'react';
import { formatEther } from '@ethersproject/units';

import { useWithdrawalsBaseData } from 'features/withdrawals/hooks';
import {
  MAX_REQUESTS_COUNT,
  MAX_REQUESTS_COUNT_LEDGER_LIMIT,
} from 'features/withdrawals/withdrawals-constants';

import { RequestsInfoStyled, RequestsInfoDescStyled } from './styles';
import { useIsLedgerLive } from 'shared/hooks/useIsLedgerLive';

type RequestsInfoProps = {
  requestCount?: number;
};

export const RequestsInfo: FC<RequestsInfoProps> = ({ requestCount }) => {
  const isLedgerLive = useIsLedgerLive();
  const maxRequestCount = isLedgerLive
    ? MAX_REQUESTS_COUNT_LEDGER_LIMIT
    : MAX_REQUESTS_COUNT;
  const wqBaseData = useWithdrawalsBaseData();
  const { maxAmount } = wqBaseData.data ?? {};

  if (requestCount && requestCount > maxRequestCount)
    return (
      <RequestsInfoStyled>
        <RequestsInfoDescStyled>
          You can send a maximum of {maxRequestCount} requests per transaction.
          Current requests count is {requestCount}.
        </RequestsInfoDescStyled>
      </RequestsInfoStyled>
    );

  if (!requestCount || requestCount === 1 || !maxAmount) return null;

  return (
    <RequestsInfoStyled>
      <RequestsInfoDescStyled>
        Your transaction will be split in {requestCount} requests because{' '}
        {formatEther(maxAmount)} ETH is the maximum amount per one transaction.
        Although it will be {requestCount} requests, you will pay one
        transaction fee.
      </RequestsInfoDescStyled>
    </RequestsInfoStyled>
  );
};
