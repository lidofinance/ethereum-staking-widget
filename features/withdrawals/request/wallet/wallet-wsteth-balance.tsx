import { Text } from '@lidofinance/lido-ui';

import { CardBalance } from 'shared/wallet';
import { FormatToken } from 'shared/formatters';
import { useStethByWsteth } from 'shared/hooks';
import { useRequestData } from 'features/withdrawals/contexts/request-data-context';

export const WalletWstethBalance = () => {
  const { wstethBalance } = useRequestData();
  const stethByWstethBalance = useStethByWsteth(wstethBalance.data);

  const stethBalanceValue = (
    <>
      <FormatToken amount={wstethBalance.data} symbol="wstETH" />
      <Text size={'xxs'} color={'secondary'}>
        ≈ <FormatToken amount={stethByWstethBalance} symbol="ETH" />
      </Text>
    </>
  );

  return (
    <CardBalance
      small
      title="wstETH Balance"
      loading={wstethBalance.initialLoading || !stethByWstethBalance}
      value={stethBalanceValue}
    />
  );
};
