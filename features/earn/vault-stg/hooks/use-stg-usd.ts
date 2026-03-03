import { useQuery } from '@tanstack/react-query';

import { useWstethUsd } from 'shared/hooks/use-wsteth-usd';
import { useMainnetOnlyWagmi } from 'modules/web3';
import { getWithdrawalParams } from '../withdraw/utils';

export const useStgUsd = (stgShares?: bigint) => {
  const { publicClientMainnet } = useMainnetOnlyWagmi();

  const query = useQuery({
    queryKey: [
      'stg',
      'stg-usd',
      {
        amount: stgShares?.toString() ?? null,
      },
    ] as const,
    enabled: stgShares !== undefined,
    queryFn: async () => {
      if (!stgShares)
        return {
          wsteth: 0n,
        };

      const { assets: wsteth } = await getWithdrawalParams({
        shares: stgShares,
        publicClient: publicClientMainnet,
      });

      return {
        wsteth,
      };
    },
  });

  const wstethUsdQuery = useWstethUsd(
    query.data?.wsteth,
    publicClientMainnet.chain?.id,
  );

  return {
    isLoading: query.isLoading || wstethUsdQuery.isLoading,
    data: {
      wsteth: query.data?.wsteth,
      eth: wstethUsdQuery.ethAmount,
      usd: wstethUsdQuery.usdAmount,
    },
  };
};
