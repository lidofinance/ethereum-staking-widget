import { usePublicClient } from 'wagmi';
import { useQuery } from '@tanstack/react-query';
import invariant from 'tiny-invariant';

import { useDebouncedValue } from 'shared/hooks/useDebouncedValue';
import { useDappStatus } from 'modules/web3/hooks/use-dapp-status';
import { useWstethUsd } from 'shared/hooks/use-wsteth-usd';
import { getWithdrawalParams } from '../utils';

export const useSTGPreviewWithdraw = ({
  shares: strethShares,
}: {
  shares?: bigint | null;
}) => {
  const { isDappActive, address: userAddress } = useDappStatus();
  const publicClient = usePublicClient();

  const isEnabled = isDappActive && strethShares != null;

  const debouncedStrethShares = useDebouncedValue(strethShares, 500);
  const isDebounced = isEnabled && strethShares !== debouncedStrethShares;

  const query = useQuery({
    queryKey: [
      'stg',
      'preview-widthdraw',
      {
        amount: isEnabled ? debouncedStrethShares?.toString() : null,
      },
    ] as const,
    enabled: isEnabled,
    queryFn: async () => {
      invariant(publicClient, 'Public client is not available');
      invariant(userAddress, 'User address is not available');

      if (!debouncedStrethShares)
        return {
          wsteth: 0n,
        };

      const { assets: wsteth } = await getWithdrawalParams({
        shares: debouncedStrethShares,
        publicClient,
      });

      return {
        wsteth,
      };
    },
  });

  const wstethUsdQuery = useWstethUsd(query.data?.wsteth ?? 0n);

  return {
    isLoading: isDebounced || query.isLoading || wstethUsdQuery.isLoading,
    data: {
      wsteth: query.data?.wsteth,
      usd: wstethUsdQuery.usdAmount,
    },
  };
};
