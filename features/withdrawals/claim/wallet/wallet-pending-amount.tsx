import { CardBalance } from 'shared/wallet';
import { FormatToken } from 'shared/formatters';
import { useClaimData } from 'features/withdrawals/contexts/claim-data-context';

export const WalletPendingAmount = () => {
  const { data, initialLoading } = useClaimData();

  const pendingAmount = (
    <FormatToken
      showAmountTip
      amount={data?.pendingAmountOfStETH}
      symbol="stETH"
    />
  );

  return (
    <CardBalance
      small
      title="My pending amount"
      loading={initialLoading}
      value={pendingAmount}
    />
  );
};
