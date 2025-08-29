import { useMemo } from 'react';
import invariant from 'tiny-invariant';
import { useQuery } from '@tanstack/react-query';
import { usePublicClient } from 'wagmi';

import { useDebouncedValue } from 'shared/hooks';
import { useDappStatus } from 'modules/web3';
import { useEthUsd } from 'shared/hooks/use-eth-usd';

import { getTokenAddress } from 'config/networks/token-address';

import { useGGVAvailable } from '../../hooks/use-ggv-available';
import {
  getGGVAccountantContract,
  getGGVLensContract,
  getGGVVaultContract,
} from '../../contracts';
import type { GGVDepositFormValues } from '../form-context/types';

export const useGGVPreviewDeposit = (
  amount?: GGVDepositFormValues['amount'],
  token?: GGVDepositFormValues['token'],
) => {
  const publicClient = usePublicClient();
  const { isDappActive } = useDappStatus();
  const { isGGVAvailable } = useGGVAvailable();

  const isEnabled = isDappActive && isGGVAvailable && amount != null;

  const values = useMemo(
    () => ({
      amount,
      token,
    }),
    [amount, token],
  );

  const debounced = useDebouncedValue(values, 500);
  const isDebounced = isEnabled && values !== debounced;

  const query = useQuery({
    queryKey: [
      'ggv',
      'preview-deposit',
      {
        amount: isEnabled ? debounced.amount?.toString() : null,
        token: isEnabled ? debounced.token?.toString() : null,
      },
    ] as const,
    enabled: isEnabled,
    queryFn: async () => {
      const { amount, token } = debounced;
      invariant(publicClient?.chain, 'Public client is not available');
      const lens = getGGVLensContract(publicClient);
      const vault = getGGVVaultContract(publicClient);
      const accountant = getGGVAccountantContract(publicClient);

      if (!amount || !token)
        return {
          shares: 0n,
          weth: 0n,
        };

      const [shares, shareRate, decimals] = await Promise.all([
        lens.read.previewDeposit([
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          getTokenAddress(
            publicClient.chain.id,
            token === 'ETH' ? 'wETH' : token,
          )!,
          amount,
          vault.address,
          accountant.address,
        ]),
        accountant.read.getRate(),
        accountant.read.decimals(),
      ]);

      const weth = (shares * shareRate) / 10n ** BigInt(decimals);

      return {
        shares,
        weth,
      };
    },
  });

  const usdQuery = useEthUsd(query.data?.weth);

  return {
    isLoading: isDebounced || query.isLoading || usdQuery.isLoading,
    data: {
      shares: query.data?.shares,
      weth: query.data?.weth,
      usd: usdQuery.usdAmount,
    },
  };
};
