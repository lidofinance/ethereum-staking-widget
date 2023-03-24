import { CardBalance } from 'shared/wallet';
import { FormatToken } from 'shared/formatters';
import { useRequestData } from 'features/withdrawals/hooks';

export const WalletStethBalance = () => {
  const { stethBalance } = useRequestData();

  const stethBalanceValue = (
    <FormatToken amount={stethBalance.data} symbol="stETH" />
  );

  return (
    <CardBalance
      small
      title="stETH Balance"
      loading={stethBalance.initialLoading}
      value={stethBalanceValue}
    />
  );
};
