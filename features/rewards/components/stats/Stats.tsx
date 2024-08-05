import { Box, Link } from '@lidofinance/lido-ui';

import { config } from 'config';
import { useRewardsHistory } from 'features/rewards/hooks';
import NumberFormat from 'features/rewards/components/NumberFormat';
import { useStethEthRate } from 'features/rewards/hooks/use-steth-eth-rate';

import { Item } from './Item';
import { Stat } from './Stat';
import { Title } from './Title';

// TODO: refactoring to style files
export const Stats: React.FC = () => {
  const {
    currencyObject: currency,
    data,
    initialLoading: pending,
  } = useRewardsHistory();
  const { data: stEthEth } = useStethEthRate();

  return (
    <>
      <Item data-testid="stEthRewardedBlock">
        <Title mb="8px">stETH earned</Title>
        <Stat data-testid="stEthRewarded" mb="4px" color="#61B75F">
          <NumberFormat number={data?.totals.ethRewards} pending={pending} />
          <Box display="inline-block" pl={'3px'}>
            stETH
          </Box>
        </Stat>
        <Title data-testid="stEthRewardedIn$" hideMobile>
          <Box display="inline-block" pr={'3px'}>
            {currency.symbol}
          </Box>
          <NumberFormat
            number={data?.totals.currencyRewards}
            currency
            pending={pending}
          />
        </Title>
      </Item>
      <Item data-testid="averageAprBlock">
        <Title mb="8px">Average APR</Title>
        <Stat data-testid="averageApr" mb="4px">
          {parseFloat(data?.averageApr || '0') ? (
            <NumberFormat number={data?.averageApr} percent pending={pending} />
          ) : (
            '-'
          )}
        </Stat>
        <Title hideMobile>
          <Link href={`${config.rootOrigin}/ethereum#apr`}>
            <Box data-testid="moreInfo">More info</Box>
          </Link>
        </Title>
      </Item>
      <Item data-testid="stEthPriceBlock">
        <Title mb="8px">stETH price</Title>
        <Stat data-testid="stEthPrice" mb="4px">
          <Box display="inline-block" pr="3px">
            {currency.symbol}
          </Box>
          <NumberFormat
            number={data?.stETHCurrencyPrice[currency.id]}
            ETH
            pending={pending}
          />
        </Stat>
        <Title data-testid="ethRate" hideMobile>
          <NumberFormat
            number={stEthEth?.toString()}
            StEthEth
            pending={pending}
          />
          <Box display="inline-block" pl={'3px'}>
            ETH
          </Box>
        </Title>
      </Item>
    </>
  );
};
