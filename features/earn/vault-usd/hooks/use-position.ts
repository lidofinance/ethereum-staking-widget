import { useQuery } from '@tanstack/react-query';
import invariant from 'tiny-invariant';

import { useDappStatus, useMainnetOnlyWagmi } from 'modules/web3';
import { getShareManagerEARNUSD } from '../contracts';
import { getUsdWithdrawalParams } from '../withdraw/utils';
import { useUsdcUsd } from 'shared/hooks/use-usdc-usd';
import { USD_VAULT_QUERY_SCOPE } from '../consts';

export const useUsdVaultPosition = () => {
  const { address, isDappActive } = useDappStatus();
  const { publicClientMainnet } = useMainnetOnlyWagmi();

  const isEnabled = isDappActive && !!address;

  const earnusdBalanceQuery = useQuery({
    queryKey: [USD_VAULT_QUERY_SCOPE, 'position', { address }] as const,
    enabled: isEnabled,
    queryFn: async () => {
      invariant(address, 'No address provided');
      invariant(publicClientMainnet, 'Public client is not available');

      const shareManager = getShareManagerEARNUSD(publicClientMainnet);

      const earnusdSharesBalance = await shareManager.read.balanceOf([address]);

      return {
        earnusdSharesBalance,
        earnusdTokenAddress: shareManager.address,
      };
    },
  });

  const earnusdShares = earnusdBalanceQuery.data?.earnusdSharesBalance ?? 0n;

  const earnusdToUsdcQuery = useQuery({
    queryKey: [
      USD_VAULT_QUERY_SCOPE,
      'position',
      'usd',
      { shares: String(earnusdShares) },
    ] as const,
    enabled: isEnabled && !!earnusdBalanceQuery.data?.earnusdSharesBalance,
    queryFn: async () => {
      invariant(publicClientMainnet, 'Public client is not available');

      const { assets: assetsUsdc } = await getUsdWithdrawalParams({
        shares: earnusdShares,
        publicClient: publicClientMainnet,
      });

      return assetsUsdc;
    },
  });

  const data = isEnabled ? earnusdBalanceQuery.data : undefined;
  const usdc = earnusdToUsdcQuery.data;

  const { usdAmount, ...usdQuery } = useUsdcUsd(usdc);

  return {
    ...earnusdBalanceQuery,
    isLoading: earnusdBalanceQuery.isLoading || earnusdToUsdcQuery.isLoading,
    data,
    earnusdSharesBalance: data?.earnusdSharesBalance,
    usdQuery,
    usdBalance: usdAmount ?? 0,
  };
};
