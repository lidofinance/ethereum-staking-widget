import { FC } from 'react';
import { BigNumber } from 'ethers';
import { formatEther } from '@ethersproject/units';

import { useWithdrawalsConstants } from 'features/withdrawals/hooks';
import { FormatToken } from 'shared/formatters';

import { Request } from './request';
import {
  RequestsInfoStyled,
  RequestsInfoDescStyled,
  RequestsInfoItemsStyled,
} from './styles';

type RequestsInfoProps = {
  requests?: BigNumber[];
};

export const RequestsInfo: FC<RequestsInfoProps> = (props) => {
  const { requests } = props;
  const { maxAmount } = useWithdrawalsConstants();

  if (!requests || !requests.length || requests.length === 1 || !maxAmount)
    return null;

  return (
    <RequestsInfoStyled>
      <RequestsInfoDescStyled>
        Your transaction will be split in {requests.length} requests because{' '}
        {formatEther(maxAmount)} ETH is the maximum amount per one transaction.
        Although it will be {requests.length} requests, you will pay one
        transaction fee.
      </RequestsInfoDescStyled>
      <RequestsInfoItemsStyled>
        {requests.map((request, index) => (
          <Request key={index} title={`Request #${index + 1}`}>
            <FormatToken amount={request} symbol="ETH" />
          </Request>
        ))}
      </RequestsInfoItemsStyled>
    </RequestsInfoStyled>
  );
};
