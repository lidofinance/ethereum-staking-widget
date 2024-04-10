import { Box, Link } from '@lidofinance/lido-ui';

import { useRewardsHistory } from 'features/rewards/hooks';
import EthSymbol from 'features/rewards/components/EthSymbol';
import NumberFormat from 'features/rewards/components/NumberFormat';
import { useStethEthRate } from 'features/rewards/hooks/use-steth-eth-rate';
import { useRewardsBalanceData } from 'features/rewards/hooks/use-rewards-balance-data';

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
  const { data: balanceData } = useRewardsBalanceData();

  return (
    <>
      <Item data-testid="stEthBalanceBlock">
        <Title mb="8px">stETH balance</Title>
        <Stat data-testid="stEthBalance" mb="6px">
          <EthSymbol />
          <NumberFormat
            number={balanceData?.stEthBalanceParsed}
            pending={pending}
          />
        </Stat>
        <Title data-testid="stEthBalanceIn$" hideMobile>
          <Box display="inline-block" pr="3px">
            {currency.symbol}
          </Box>
          <NumberFormat
            number={balanceData?.stEthCurrencyBalance}
            currency
            pending={pending}
          />
        </Title>
      </Item>
      <Item data-testid="stEthRewardedBlock">
        <Title mb="8px">stETH rewarded</Title>
        <Stat data-testid="stEthRewarded" mb="6px" color="#61B75F">
          <EthSymbol />
          <NumberFormat number={data?.totals.ethRewards} pending={pending} />
        </Stat>
        <Title data-testid="stEthRewardedIn$" hideMobile>
          <Box display="inline-block" pr="3px">
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
        <Stat data-testid="averageApr" mb="6px">
          {parseFloat(data?.averageApr || '0') ? (
            <NumberFormat number={data?.averageApr} percent pending={pending} />
          ) : (
            '-'
          )}
        </Stat>
        <Title hideMobile>
          <Link href="https://lido.fi/faq">
            <Box
              data-testid="moreInfo"
              color="secondary"
              style={{ textDecoration: 'underline' }}
            >
              More info
            </Box>
          </Link>
        </Title>
      </Item>
      <Item data-testid="stEthPriceBlock">
        <Title mb="8px">stETH price</Title>
        <Stat data-testid="stEthPrice" mb="6px">
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
          <EthSymbol />
          <NumberFormat
            number={stEthEth?.toString()}
            StEthEth
            pending={pending}
          />
        </Title>
      </Item>
    </>
  );
};
