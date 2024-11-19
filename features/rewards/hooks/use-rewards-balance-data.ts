import { useMemo } from 'react';
import { getAddress } from 'viem';

import { useStethBalance } from 'modules/web3';

import { useRewardsHistory } from './useRewardsHistory';
import { useLaggyDataWrapper } from './use-laggy-data-wrapper';

export const useRewardsBalanceData = () => {
  // const { address, data, currencyObject } = useRewardsHistory();
  const { address } = useRewardsHistory();
  const { data: stethBalance } = useStethBalance({
    account: address ? getAddress(address) : undefined,
  });

  const balanceData = useMemo(
    () =>
      stethBalance
        ? {
            stEthBalanceParsed: 123,
            stEthCurrencyBalance: 123,
            // TODO: NEW SDK (remove new Big)
            // stEthBalanceParsed: new Big(stethBalance.toString()),
            // stEthCurrencyBalance:
            //   data &&
            //   // TODO: NEW SDK (remove BN)
            //   new BigDecimal(stethBalance.toString()) // Convert to right BN
            //     .div(ETHER)
            //     .times(data.stETHCurrencyPrice[currencyObject.id]),
          }
        : null,
    [stethBalance],
    // [currencyObject.id, data, stethBalance],
  );

  const { isLagging, dataOrLaggyData } = useLaggyDataWrapper(balanceData);

  return { isLagging: !!address && isLagging, data: dataOrLaggyData };
};
