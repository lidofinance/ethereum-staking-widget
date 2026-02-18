import { useQuery } from '@tanstack/react-query';
import invariant from 'tiny-invariant';

import { useDappStatus, useMainnetOnlyWagmi } from 'modules/web3';
import { getShareManagerContractEARNETH } from '../contracts';
import { getWithdrawalParams } from '../withdraw/utils';
import { useWstethUsd } from 'shared/hooks/use-wsteth-usd';
import { ETH_VAULT_QUERY_SCOPE } from '../consts';

export const useEthVaultPosition = () => {
  const { address, isDappActive } = useDappStatus();
  const { publicClientMainnet } = useMainnetOnlyWagmi();

  const isEnabled = isDappActive && !!address;

  const earnethBalanceQuery = useQuery({
    queryKey: [ETH_VAULT_QUERY_SCOPE, 'position', { address }] as const,
    enabled: isEnabled,
    queryFn: async () => {
      invariant(address, 'No address provided');
      invariant(publicClientMainnet, 'Public client is not available');

      const shareManager = getShareManagerContractEARNETH(publicClientMainnet);

      const earnethSharesBalance = await shareManager.read.balanceOf([address]);

      return {
        earnethSharesBalance,
        earnethTokenAddress: shareManager.address,
      };
    },
  });

  const earnethShares = earnethBalanceQuery.data?.earnethSharesBalance ?? 0n;

  const earnethToWstethQuery = useQuery({
    queryKey: [
      ETH_VAULT_QUERY_SCOPE,
      'position',
      'usd',
      { shares: String(earnethShares) },
    ] as const,
    enabled: isEnabled && !!earnethBalanceQuery.data?.earnethSharesBalance,
    queryFn: async () => {
      invariant(publicClientMainnet, 'Public client is not available');

      const { assets: assetsWsteth } = await getWithdrawalParams({
        shares: earnethShares,
        publicClient: publicClientMainnet,
      });

      return assetsWsteth;
    },
  });

  const data = isEnabled ? earnethBalanceQuery.data : undefined;
  const wsteth = earnethToWstethQuery.data;

  const { usdAmount, ...usdQuery } = useWstethUsd(
    wsteth,
    publicClientMainnet.chain?.id,
  );

  return {
    ...earnethBalanceQuery,
    isLoading: earnethBalanceQuery.isLoading || earnethToWstethQuery.isLoading,
    data,
    earnethSharesBalance: data?.earnethSharesBalance,
    usdQuery,
    usdBalance: usdAmount ?? 0,
  };
};
