import { FC } from 'react';
import { Box } from '@lidofinance/lido-ui';

import { useRewardsHistory } from 'features/rewards/hooks';
import NumberFormat from 'features/rewards/components/NumberFormat';

import { Item } from './components/item';

export const StEthRewardedBlock: FC = () => {
  const {
    currencyObject: currency,
    data,
    initialLoading: loading,
  } = useRewardsHistory();

  return (
    <Item
      loading={loading}
      dataTestId="stEthRewardedBlock"
      title="stETH rewarded"
      value={
        <>
          <NumberFormat number={data?.totals.ethRewards} StEthEth />
          <Box display="inline-block" pl={'3px'}>
            stETH
          </Box>
        </>
      }
      valueDataTestId="stEthRewardedIn$"
      valueGreenText={true}
      underValue={
        <>
          <Box display="inline-block" pr={'3px'}>
            {currency.symbol}
          </Box>
          <NumberFormat number={data?.totals.currencyRewards} currency />
        </>
      }
      underValueDataTestId="stEthBalanceIn$"
    />
  );
};
