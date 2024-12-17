import { FC } from 'react';
import { Box } from '@lidofinance/lido-ui';

import NumberFormat from 'features/rewards/components/NumberFormat';
import { useRewardsHistory } from 'features/rewards/hooks';
import { useStethEthRate } from 'features/rewards/hooks/use-steth-eth-rate';

import { Item } from './components/item';

export const StEthPriceBlock: FC = () => {
  const { currencyObject: currency, data, isLoading } = useRewardsHistory();
  const { data: stEthEth, isLoading: isLoadingStEthEth } = useStethEthRate({
    enabled: !!data?.stETHCurrencyPrice[currency.id],
  });

  return (
    <Item
      loading={isLoading || isLoadingStEthEth}
      dataTestId="stEthPriceBlock"
      title="stETH price"
      value={
        data?.stETHCurrencyPrice[currency.id] ? (
          <>
            <Box display="inline-block" pr="3px">
              {currency.symbol}
            </Box>
            <NumberFormat
              number={data?.stETHCurrencyPrice[currency.id]}
              currency
            />
          </>
        ) : (
          '—'
        )
      }
      valueDataTestId="stEthPrice"
      underValue={
        data?.stETHCurrencyPrice[currency.id] ? (
          <>
            <NumberFormat number={stEthEth?.toString()} StEthEth />
            <Box display="inline-block" pl={'3px'}>
              ETH
            </Box>
          </>
        ) : (
          '—'
        )
      }
      underValueDataTestId="ethRate"
    />
  );
};
