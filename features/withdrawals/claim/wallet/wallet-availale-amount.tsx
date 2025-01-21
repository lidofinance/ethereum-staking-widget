import { CardBalance } from 'shared/wallet';
import { FormatToken } from 'shared/formatters';
import { useClaimData } from 'features/withdrawals/contexts/claim-data-context';

export const WalletAvailableAmount = () => {
  const { data, isLoading } = useClaimData();

  const availableAmount = (
    <FormatToken amount={data?.claimableAmountOfETH} symbol="ETH" />
  );

  return (
    <CardBalance
      small
      data-testid="availableToClaim"
      title="Available to claim"
      loading={isLoading}
      value={availableAmount}
    />
  );
};
