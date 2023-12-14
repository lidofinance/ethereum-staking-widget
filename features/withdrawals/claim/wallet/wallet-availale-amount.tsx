import { CardBalance } from 'shared/wallet';
import { FormatToken } from 'shared/formatters';
import { useClaimData } from 'features/withdrawals/contexts/claim-data-context';

export const WalletAvailableAmount = () => {
  const { data, initialLoading } = useClaimData();

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
      data-testid="avaialableToClaim"
      title="Available to claim"
      loading={initialLoading}
      value={availableAmount}
    />
  );
};
