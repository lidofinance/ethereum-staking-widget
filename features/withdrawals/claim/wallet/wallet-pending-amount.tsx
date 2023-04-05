import { CardBalance } from 'shared/wallet';
import { FormatToken } from 'shared/formatters';
import { useClaimData } from 'features/withdrawals/contexts/claim-data-context';

export const WalletPendingAmount = () => {
  const { withdrawalRequestsData } = useClaimData();
  const { loading, data } = withdrawalRequestsData;

  const pendingAmount = (
    <FormatToken amount={data?.pendingAmountOfStETH} symbol="stETH" />
  );

  return (
    <CardBalance
      small
      title="My pending amount"
      loading={loading}
      value={pendingAmount}
    />
  );
};
