import { FC, useCallback, useEffect, useState } from 'react';
import { Box, Link } from '@lidofinance/lido-ui';
import EthSymbol from 'features/rewards/components/EthSymbol';
import NumberFormat from 'features/rewards/components/NumberFormat';
import type { BigNumber as EthersBigNumber } from 'ethers';
import { constants } from 'ethers';
import { dynamics } from 'config';

import { Big, BigDecimal } from 'features/rewards/helpers';
import { ETHER } from 'features/rewards/constants';

import { useSDK, useTokenBalance } from '@lido-sdk/react';
import { TOKENS, getTokenAddress } from '@lido-sdk/constants';
import { stEthEthRequest } from 'features/rewards/fetchers/requesters';

import { Item } from './Item';
import { Stat } from './Stat';
import { Title } from './Title';
import { StatsProps } from './types';
import { STRATEGY_LAZY } from 'utils/swrStrategies';

// TODO: refactoring to style files
export const Stats: FC<StatsProps> = (props) => {
  const { address, data, currency, pending } = props;

  const [stEthEth, setStEthEth] = useState<EthersBigNumber>();
  const { chainId } = useSDK();

  const steth = useTokenBalance(
    getTokenAddress(chainId, TOKENS.STETH),
    address,
    STRATEGY_LAZY,
  );

  const getStEthEth = useCallback(async () => {
    if (dynamics.defaultChain !== 1) {
      setStEthEth(constants.WeiPerEther);
    } else {
      const stEthEth = await stEthEthRequest();

      setStEthEth(stEthEth);
    }
  }, []);

  useEffect(() => {
    getStEthEth();
  }, [getStEthEth]);

  const stEthBalanceParsed = steth.data && new Big(steth.data.toString());
  const stEthCurrencyBalance =
    steth.data &&
    data &&
    new BigDecimal(steth.data.toString()) // Convert to right BN
      .div(ETHER)
      .times(data.stETHCurrencyPrice[currency.id]);

  return (
    <>
      <Item>
        <Title mb="8px">stETH balance</Title>
        <Stat mb="6px">
          <EthSymbol />
          <NumberFormat
            id="stEthBalance"
            number={stEthBalanceParsed}
            pending={pending}
          />
        </Stat>
        <Title hideMobile>
          <Box display="inline-block" pr="3px">
            {currency.symbol}
          </Box>
          <NumberFormat
            number={stEthCurrencyBalance}
            currency
            pending={pending}
          />
        </Title>
      </Item>
      <Item>
        <Title mb="8px">stETH rewarded</Title>
        <Stat mb="6px" color="#61B75F">
          <EthSymbol />
          <NumberFormat number={data?.totals.ethRewards} pending={pending} />
        </Stat>
        <Title hideMobile>
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
      <Item>
        <Title mb="8px">Average APR</Title>
        <Stat mb="6px">
          {parseFloat(data?.averageApr || '0') ? (
            <NumberFormat
              id="averageApr"
              number={data?.averageApr}
              percent
              pending={pending}
            />
          ) : (
            '-'
          )}
        </Stat>
        <Title hideMobile>
          <Link href="https://lido.fi/faq">
            <Box color="secondary" style={{ textDecoration: 'underline' }}>
              More info
            </Box>
          </Link>
        </Title>
      </Item>
      <Item>
        <Title mb="8px">stETH price</Title>
        <Stat mb="6px">
          <Box display="inline-block" pr="3px">
            {currency.symbol}
          </Box>
          <NumberFormat
            number={data?.stETHCurrencyPrice[currency.id]}
            ETH
            pending={pending}
          />
        </Stat>
        <Title hideMobile>
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
