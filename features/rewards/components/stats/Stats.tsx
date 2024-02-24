import { FC, useCallback, useEffect, useState } from 'react';
import type { BigNumber as EthersBigNumber } from 'ethers';
import { constants } from 'ethers';

import { Box, Link } from '@lidofinance/lido-ui';
import { useSDK, useTokenBalance } from '@lido-sdk/react';
import { TOKENS, getTokenAddress } from '@lido-sdk/constants';

import { getOneConfig } from 'config/one-config/utils';
const { defaultChain } = getOneConfig();

import { stEthEthRequest } from 'features/rewards/fetchers/requesters';
import EthSymbol from 'features/rewards/components/EthSymbol';
import NumberFormat from 'features/rewards/components/NumberFormat';
import { Big, BigDecimal } from 'features/rewards/helpers';
import { ETHER } from 'features/rewards/constants';
import { STRATEGY_LAZY } from 'utils/swrStrategies';
import { useMainnetStaticRpcProvider } from 'shared/hooks/use-mainnet-static-rpc-provider';

import { Item } from './Item';
import { Stat } from './Stat';
import { Title } from './Title';
import { StatsProps } from './types';

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
  const mainnetStaticRpcProvider = useMainnetStaticRpcProvider();

  const getStEthEth = useCallback(async () => {
    if (defaultChain !== 1) {
      setStEthEth(constants.WeiPerEther);
    } else {
      const stEthEth = await stEthEthRequest(mainnetStaticRpcProvider);

      setStEthEth(stEthEth);
    }
  }, [mainnetStaticRpcProvider]);

  useEffect(() => {
    void getStEthEth();
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
      <Item data-testid="stEthBalanceBlock">
        <Title mb="8px">stETH balance</Title>
        <Stat data-testid="stEthBalance" mb="6px">
          <EthSymbol />
          <NumberFormat number={stEthBalanceParsed} pending={pending} />
        </Stat>
        <Title data-testid="stEthBalanceIn$" hideMobile>
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
