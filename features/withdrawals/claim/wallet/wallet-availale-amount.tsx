import { CardBalance } from 'shared/wallet';
import { FormatToken } from 'shared/formatters';
import { useClaimData } from 'features/withdrawals/contexts/claim-data-context';

export const WalletAvailableAmount = () => {
  const { withdrawalRequestsData } = useClaimData();
  const { data, loading } = withdrawalRequestsData;

  const availableAmount = (
    <FormatToken
      showAmountTip
      amount={data?.claimableAmountOfETH}
      symbol="ETH"
    />
  );

  return (
    <CardBalance
      small
      title="Available to claim"
      loading={loading}
      value={availableAmount}
    />
  );
};
