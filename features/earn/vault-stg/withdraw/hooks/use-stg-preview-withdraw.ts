import { usePublicClient } from 'wagmi';
import { useQuery } from '@tanstack/react-query';
import invariant from 'tiny-invariant';

import { useDebouncedValue } from 'shared/hooks/useDebouncedValue';
import { useDappStatus } from 'modules/web3/hooks/use-dapp-status';
import { useWstethUsd } from 'shared/hooks/use-wsteth-usd';
import { STGWithdrawFormValues } from '../form-context/types';
import { getWithdrawalParams } from '../utils';

export const useSTGPreviewWithdraw = ({
  amount,
}: {
  amount?: STGWithdrawFormValues['amount'];
}) => {
  const { isDappActive, address: userAddress } = useDappStatus();
  const publicClient = usePublicClient();

  const isEnabled = isDappActive && amount != null;

  const debouncedAmount = useDebouncedValue(amount, 500);
  const isDebounced = isEnabled && amount !== debouncedAmount;

  const query = useQuery({
    queryKey: [
      'stg',
      'preview-widthdraw',
      {
        amount: isEnabled ? debouncedAmount?.toString() : null,
      },
    ] as const,
    enabled: isEnabled,
    queryFn: async () => {
      invariant(publicClient, 'Public client is not available');
      invariant(userAddress, 'User address is not available');

      if (!debouncedAmount)
        return {
          wsteth: 0n,
        };

      const { assets: wsteth } = await getWithdrawalParams({
        shares: debouncedAmount,
        publicClient,
      });

      return {
        wsteth,
      };
    },
  });

  const wstethUsdQuery = useWstethUsd(debouncedAmount ?? 0n);

  return {
    isLoading: isDebounced || query.isLoading || wstethUsdQuery.isLoading,
    data: {
      wsteth: query.data?.wsteth,
      usd: wstethUsdQuery.usdAmount,
    },
  };
};
