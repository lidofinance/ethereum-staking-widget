import { FC, useCallback } from 'react';
import VirtualList, { Props } from 'react-tiny-virtual-list';
import { useClaimData } from 'features/withdrawals/hooks';
import { formatBalance } from 'utils';

import { Request } from './request';
import { Empty } from './empty';

type RequestsProps = {
  height: number;
};

type renderItemCallback = Props['renderItem'];

const renderItemLoading: renderItemCallback = ({ index, style }) => {
  return (
    <Request
      tokenId={'0'}
      outerStyle={style}
      key={index}
      label={''}
      status={'loading'}
    />
  );
};

export const Requests: FC<RequestsProps> = ({ height }) => {
  const { requests, claimSelection, withdrawalRequestsData } = useClaimData();

  const renderItem = useCallback<renderItemCallback>(
    ({ index, style }) => {
      const request = requests[index];

      const amountValue =
        'claimableEth' in request
          ? request.claimableEth
          : request.amountOfStETH;
      const amount = `${formatBalance(amountValue)} ${
        'claimableEth' in request ? 'ETH' : 'stETH'
      }`;

      return (
        <Request
          // this is ok because render is virtualized
          checked={claimSelection.isSelected(request.stringId)}
          outerStyle={style}
          key={request.stringId}
          tokenId={request.stringId}
          label={amount}
          status={request.isFinalized ? 'ready' : 'pending'}
          onSelectToken={claimSelection.setSelected}
        />
      );
    },
    [requests, claimSelection],
  );

  const notEmpty = withdrawalRequestsData.loading || requests.length !== 0;
  const listProps =
    withdrawalRequestsData.loading && requests.length == 0
      ? {
          style: { overflow: 'hidden' },
          itemCount: 14,
          renderItem: renderItemLoading,
        }
      : {
          itemCount: requests.length,
          renderItem,
        };

  return (
    <>
      {notEmpty ? (
        <VirtualList height={height} itemSize={56} {...listProps} />
      ) : (
        <Empty height={height} />
      )}
    </>
  );
};
