import { EmptyText, WrapperEmpty } from './styles';

type RequestsEmptyProps = {
  isWalletConnected?: boolean;
};

export const RequestsEmpty = ({ isWalletConnected }: RequestsEmptyProps) => {
  if (!isWalletConnected) {
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
