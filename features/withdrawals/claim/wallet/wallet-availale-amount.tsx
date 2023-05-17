import { CardBalance } from 'shared/wallet';
import { FormatToken } from 'shared/formatters';
import { useClaimData } from 'features/withdrawals/contexts/claim-data-context';

export const WalletAvailableAmount = () => {
  const { withdrawalRequestsData, loading } = useClaimData();

  const availableAmount = (
    <FormatToken
      showAmountTip
      amount={withdrawalRequestsData?.claimableAmountOfETH}
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
