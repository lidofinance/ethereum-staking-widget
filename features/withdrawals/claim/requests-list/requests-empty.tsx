import { useWeb3 } from 'reef-knot';

import { EmptyText, DownloadIcon, WrapperEmpty } from './styles';

export const RequestsEmpty = () => {
  const { active } = useWeb3();

  if (!active) {
    return (
      <WrapperEmpty>
        <EmptyText>
          <DownloadIcon />
          Connect wallet to see your withdrawal requests
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
