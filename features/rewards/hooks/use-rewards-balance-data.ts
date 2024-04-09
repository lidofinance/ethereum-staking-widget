import { useMemo } from 'react';
import { useSDK, useTokenBalance } from '@lido-sdk/react';
import { TOKENS, getTokenAddress } from '@lido-sdk/constants';

import { STRATEGY_LAZY } from 'consts/swr-strategies';
import { ETHER } from 'features/rewards/constants';

import { useRewardsHistory } from './useRewardsHistory';
import { useLaggyDataWrapper } from './use-laggy-data-wrapper';
import { Big, BigDecimal } from '../helpers';

export const useRewardsBalanceData = () => {
  const { chainId } = useSDK();
  const { address, data, currencyObject } = useRewardsHistory();

  const { data: steth } = useTokenBalance(
    getTokenAddress(chainId, TOKENS.STETH),
    address,
    STRATEGY_LAZY,
  );

  const balanceData = useMemo(
    () =>
      steth
        ? {
            stEthBalanceParsed: new Big(steth.toString()),
            stEthCurrencyBalance:
              data &&
              new BigDecimal(steth.toString()) // Convert to right BN
                .div(ETHER)
                .times(data.stETHCurrencyPrice[currencyObject.id]),
          }
        : null,
    [currencyObject.id, data, steth],
  );

  const { isLagging, dataOrLaggyData } = useLaggyDataWrapper(balanceData);

  return { isLagging: !!address && isLagging, data: dataOrLaggyData };
};
