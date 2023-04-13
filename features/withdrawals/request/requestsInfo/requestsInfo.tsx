import { FC } from 'react';
import { formatEther } from '@ethersproject/units';

import { useWithdrawalsConstants } from 'features/withdrawals/hooks';
import { MAX_REQUESTS_COUNT } from 'features/withdrawals/withdrawalsConstants';

import { RequestsInfoStyled, RequestsInfoDescStyled } from './styles';

type RequestsInfoProps = {
  requestCount?: number;
};

export const RequestsInfo: FC<RequestsInfoProps> = (props) => {
  const { requestCount } = props;
  const { maxAmount } = useWithdrawalsConstants();

  if (requestCount && requestCount > MAX_REQUESTS_COUNT)
    return (
      <RequestsInfoStyled>
        <RequestsInfoDescStyled>
          You can send a maximum of 200 requests per transaction. Current
          requests count is {requestCount}.
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
