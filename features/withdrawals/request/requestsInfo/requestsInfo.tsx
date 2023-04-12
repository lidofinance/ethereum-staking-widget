import { FC } from 'react';
import { BigNumber } from 'ethers';
import { formatEther } from '@ethersproject/units';

import { useWithdrawalsConstants } from 'features/withdrawals/hooks';
import { MAX_REQUESTS_COUNT } from 'features/withdrawals/withdrawalsConstants';

import { RequestsInfoStyled, RequestsInfoDescStyled } from './styles';

type RequestsInfoProps = {
  requests?: BigNumber[];
  requestsCount?: number;
};

export const RequestsInfo: FC<RequestsInfoProps> = (props) => {
  const { requestsCount } = props;
  const { maxAmount } = useWithdrawalsConstants();

  if (requestsCount && requestsCount > MAX_REQUESTS_COUNT)
    return (
      <RequestsInfoStyled>
        <RequestsInfoDescStyled>
          You can send a maximum of 200 requests per transaction. Current
          requests count is {requestsCount}.
        </RequestsInfoDescStyled>
      </RequestsInfoStyled>
    );

  if (!requestsCount || requestsCount === 1 || !maxAmount) return null;

  return (
    <RequestsInfoStyled>
      <RequestsInfoDescStyled>
        Your transaction will be split in {requestsCount} requests because{' '}
        {formatEther(maxAmount)} ETH is the maximum amount per one transaction.
        Although it will be {requestsCount} requests, you will pay one
        transaction fee.
      </RequestsInfoDescStyled>
    </RequestsInfoStyled>
  );
};
