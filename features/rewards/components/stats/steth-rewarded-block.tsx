import { FC } from 'react';
import { Box } from '@lidofinance/lido-ui';

import { useRewardsHistory } from 'features/rewards/hooks';
import NumberFormat from 'features/rewards/components/NumberFormat';

import { Item } from './components/item';
import { GreenText } from './components/styles';

export const StEthRewardedBlock: FC = () => {
  const { currencyObject: currency, data, isLoading } = useRewardsHistory();

  return (
    <Item
      loading={isLoading}
      dataTestId="stEthRewardedBlock"
      title="stETH rewarded"
      value={
        data?.totals.ethRewards ? (
          <GreenText>
            <NumberFormat number={data?.totals.ethRewards} />
            <Box display="inline-block" pl={'3px'}>
              stETH
            </Box>
          </GreenText>
        ) : (
          '—'
        )
      }
      valueDataTestId="stEthRewarded"
      underValue={
        data?.totals.currencyRewards ? (
          <>
            <Box display="inline-block" pr={'3px'}>
              {currency.symbol}
            </Box>
            <NumberFormat number={data?.totals.currencyRewards} currency />
          </>
        ) : (
          '—'
        )
      }
      underValueDataTestId="stEthRewardedIn$"
    />
  );
};
