import { CardBalance } from 'shared/wallet';
import { FormatToken } from 'shared/formatters';
import { useClaimData } from 'features/withdrawals/contexts/claim-data-context';

export const WalletPendingAmount = () => {
  const { withdrawalRequestsData, loading } = useClaimData();

  const pendingAmount = (
    <FormatToken
      showAmountTip
      amount={withdrawalRequestsData?.pendingAmountOfStETH}
      symbol="stETH"
    />
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
