import { useMemo } from 'react';
import { getAddress } from 'viem';

import { useStethBalance } from 'modules/web3';
import { ETHER } from 'features/rewards/constants';

import { useRewardsHistory } from './useRewardsHistory';
import { useLaggyDataWrapper } from './use-laggy-data-wrapper';

export const useRewardsBalanceData = () => {
  const { address, data, currencyObject } = useRewardsHistory();
  const { data: stethBalance } = useStethBalance({
    account: address ? getAddress(address) : undefined,
  });

  const balanceData = useMemo(
    () =>
      stethBalance
        ? {
            stEthBalanceParsed: stethBalance.toString(),
            stEthCurrencyBalance:
              // accuracy is okay for display
              data &&
              stethBalance &&
              (Number(stethBalance) / Number(ETHER)) *
                data?.stETHCurrencyPrice[currencyObject.id],
          }
        : null,
    [currencyObject.id, data, stethBalance],
  );

  const { isLagging, dataOrLaggyData } = useLaggyDataWrapper(balanceData);

  return { isLagging: !!address && isLagging, data: dataOrLaggyData };
};
