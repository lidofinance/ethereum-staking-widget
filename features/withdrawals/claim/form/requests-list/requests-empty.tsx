import { CHAINS } from '@lido-sdk/constants';
import { useUserConfig } from 'config/user-config';

import { EmptyText, WrapperEmpty } from './styles';

type RequestsEmptyProps = {
  isWalletConnected?: boolean;
  isDappActive?: boolean;
};

export const RequestsEmpty = ({
  isWalletConnected,
  isDappActive,
}: RequestsEmptyProps) => {
  const { defaultChain } = useUserConfig();

  if (!isWalletConnected) {
    return (
      <WrapperEmpty>
        <EmptyText>Connect wallet to see your withdrawal requests</EmptyText>
      </WrapperEmpty>
    );
  }

  if (isWalletConnected && !isDappActive) {
    return (
      <WrapperEmpty>
        <EmptyText>
          Switch to {CHAINS[defaultChain]} to see your withdrawal requests
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
