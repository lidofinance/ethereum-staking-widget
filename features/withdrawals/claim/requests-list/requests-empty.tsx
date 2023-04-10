import { useWeb3 } from 'reef-knot/web3-react';

import { EmptyText, DownloadIcon, WrapperEmpty } from './styles';

export const RequestsEmpty = () => {
  const { active } = useWeb3();

  if (!active) {
    return (
      <WrapperEmpty>
        <EmptyText>
          <DownloadIcon />
          Connect wallet to see your withdrawal request data{' '}
        </EmptyText>
      </WrapperEmpty>
    );
  }

  return (
    <WrapperEmpty>
      <EmptyText>No withdrawal requests detected.</EmptyText>
    </WrapperEmpty>
  );
};
