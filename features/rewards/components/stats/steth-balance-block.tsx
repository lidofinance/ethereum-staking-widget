import { FC } from 'react';
import { Box } from '@lidofinance/lido-ui';

import NumberFormat from 'features/rewards/components/NumberFormat';
import { useRewardsHistory } from 'features/rewards/hooks';
import { useRewardsBalanceData } from 'features/rewards/hooks/use-rewards-balance-data';
import { useDappStatus } from 'shared/hooks/use-dapp-status';

import { Item } from './components/item';

export const StEthBalanceBlock: FC = () => {
  const { isWalletConnected, isSupportedChain } = useDappStatus();
  const { data: balanceData } = useRewardsBalanceData();
  const { currencyObject: currency, loading } = useRewardsHistory();

  return (
    <Item
      loading={loading}
      dataTestId="stEthBalanceBlock"
      title="stETH balance"
      value={
        (isWalletConnected && !isSupportedChain) ||
        !balanceData?.stEthBalanceParsed ? (
          '—'
        ) : (
          <>
            <NumberFormat number={balanceData?.stEthBalanceParsed} />
            <Box display="inline-block" pl={'3px'}>
              stETH
            </Box>
          </>
        )
      }
      valueDataTestId="stEthBalance"
      underValue={
        (isWalletConnected && !isSupportedChain) ||
        !balanceData?.stEthCurrencyBalance ? (
          '—'
        ) : (
          <>
            <Box display="inline-block" pr={'3px'}>
              {currency.symbol}
            </Box>
            <NumberFormat number={balanceData?.stEthCurrencyBalance} currency />
          </>
        )
      }
      underValueDataTestId="stEthBalanceIn$"
    />
  );
};
