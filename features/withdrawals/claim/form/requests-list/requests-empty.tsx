import { EmptyText, WrapperEmpty } from './styles';
import { useDappStatus } from 'modules/web3';
import { joinWithOr } from 'utils/join-with-or';

export const RequestsEmpty = () => {
  const { isWalletConnected, isSupportedChain, supportedChainLabels } =
    useDappStatus();

  if (!isWalletConnected) {
    return (
      <WrapperEmpty>
        <EmptyText>Connect wallet to see your withdrawal requests</EmptyText>
      </WrapperEmpty>
    );
  }

  if (isWalletConnected && !isSupportedChain) {
    return (
      <WrapperEmpty>
        <EmptyText>
          Switch to {joinWithOr(supportedChainLabels)} to see your withdrawal
          requests
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
