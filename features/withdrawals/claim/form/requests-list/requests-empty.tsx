import { useWeb3 } from 'reef-knot/web3-react';

import { EmptyText, WrapperEmpty } from './styles';

export const RequestsEmpty = () => {
  const { active } = useWeb3();

  if (!active) {
    return (
      <WrapperEmpty>
        <EmptyText>Connect wallet to see your withdrawal requests</EmptyText>
      </WrapperEmpty>
    );
  }

  return (
    <WrapperEmpty>
      <EmptyText>No withdrawal requests detected.</EmptyText>
    </WrapperEmpty>
  );
};
