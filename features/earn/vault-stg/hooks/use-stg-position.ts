import { useQuery } from '@tanstack/react-query';
import invariant from 'tiny-invariant';

import { useDappStatus, useMainnetOnlyWagmi } from 'modules/web3';
import { getContractAddress } from 'config/networks/contract-address';
import { CHAINS } from 'consts/chains';
import { standardFetcher } from 'utils/standardFetcher';
import { getSTGShareManagerSTRETH } from '../contracts';
import { getWithdrawalParams } from '../withdraw/utils';
import { useWstethUsd } from 'shared/hooks/use-wsteth-usd';
import { getMellowUserPointsWei } from 'features/earn/shared/api/mellow-points';
import { STG_STATS_ORIGIN } from '../consts';

export const useSTGPosition = () => {
  const { address, isDappActive } = useDappStatus();
  const { publicClientMainnet } = useMainnetOnlyWagmi();
  const stgVaultAddress = getContractAddress(CHAINS.Mainnet, 'stgVault');
  invariant(stgVaultAddress, 'No STG vault address found');

  const isEnabled = isDappActive && !!address;

  const strethBalanceQuery = useQuery({
    queryKey: ['stg', 'position', { address }] as const,
    enabled: isEnabled,
    queryFn: async () => {
      invariant(address, 'No address provided');
      invariant(publicClientMainnet, 'Public client is not available');

      const shareManager = getSTGShareManagerSTRETH(publicClientMainnet);

      const strethSharesBalance = await shareManager.read.balanceOf([address]);

      return {
        strethSharesBalance,
        strethTokenAddress: shareManager.address,
      };
    },
  });

  const strethShares = strethBalanceQuery.data?.strethSharesBalance ?? 0n;

  const mellowPointsBalanceQuery = useQuery({
    queryKey: ['stg', 'mellow-points', { address }] as const,
    enabled: isEnabled,
    queryFn: async () => {
      const userPointsUrl = `${STG_STATS_ORIGIN}/v1/chain/1/users/${address}`;
      // validated and converted to wei here, so components never parse it
      return getMellowUserPointsWei(
        await standardFetcher<unknown>(userPointsUrl),
        stgVaultAddress,
      );
    },
  });

  const strethToWstethQuery = useQuery({
    queryKey: [
      'stg',
      'position',
      'usd',
      { shares: String(strethShares) },
    ] as const,
    enabled: isEnabled && !!strethBalanceQuery.data?.strethSharesBalance,
    queryFn: async () => {
      invariant(publicClientMainnet, 'Public client is not available');

      const { assets: assetsWsteth } = await getWithdrawalParams({
        shares: strethShares,
        publicClient: publicClientMainnet,
      });
      return assetsWsteth;
    },
  });

  const data = isEnabled ? strethBalanceQuery.data : undefined;
  const wsteth = strethToWstethQuery.data;
  const mellowPoints = mellowPointsBalanceQuery.data;

  const { usdAmount, ...usdQuery } = useWstethUsd(
    wsteth,
    publicClientMainnet.chain?.id,
  );

  return {
    ...strethBalanceQuery,
    isLoading:
      strethBalanceQuery.isLoading ||
      mellowPointsBalanceQuery.isLoading ||
      strethToWstethQuery.isLoading,
    data,
    mellowPoints,
    strethSharesBalance: data?.strethSharesBalance,
    usdQuery,
    usdBalance: usdAmount ?? 0,
  };
};
