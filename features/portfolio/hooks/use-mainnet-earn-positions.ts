import { useQuery } from '@tanstack/react-query';
import type { Address } from 'viem';
import invariant from 'tiny-invariant';

import { useMainnetOnlyWagmi } from 'modules/web3';
import { CHAINS } from 'consts/chains';
import { config } from 'config';
import { useWstethUsd } from 'shared/hooks/use-wsteth-usd';
import { useUsdcToUsd } from 'shared/hooks/use-usdc-to-usd';
import { getShareManagerContractEARNETH } from 'features/earn/vault-eth/contracts';
import { getWithdrawalParams } from 'features/earn/vault-eth/withdraw/utils';
import { getShareManagerEARNUSD } from 'features/earn/vault-usd/contracts';
import { getUsdWithdrawalParams } from 'features/earn/vault-usd/withdraw/utils';

import { PORTFOLIO_QUERY_SCOPE } from '../consts';

// Earn hooks need an active dapp chain; these read Ethereum from any chain
export const useMainnetEarnPositions = (address?: Address) => {
  const { publicClientMainnet } = useMainnetOnlyWagmi();

  const earnBalancesQuery = useQuery({
    queryKey: [PORTFOLIO_QUERY_SCOPE, 'mainnet-earn', { address }] as const,
    enabled: !!address && !!publicClientMainnet,
    staleTime: config.PROVIDER_POLLING_INTERVAL,
    refetchInterval: config.PROVIDER_POLLING_INTERVAL,
    queryFn: async () => {
      invariant(address, 'No address provided');
      const [earneth, earnusd] = await Promise.all([
        getShareManagerContractEARNETH(publicClientMainnet).read.balanceOf([
          address,
        ]),
        getShareManagerEARNUSD(publicClientMainnet).read.balanceOf([address]),
      ]);
      const [earnEthWithdrawalParams, earnUsdWithdrawalParams] =
        await Promise.all([
          earneth > 0n
            ? getWithdrawalParams({
                shares: earneth,
                publicClient: publicClientMainnet,
              })
            : null,
          earnusd > 0n
            ? getUsdWithdrawalParams({
                shares: earnusd,
                publicClient: publicClientMainnet,
              })
            : null,
        ]);
      return {
        earneth,
        earnusd,
        earnethInWsteth: earnEthWithdrawalParams?.assets ?? 0n,
        earnusdInUsdc: earnUsdWithdrawalParams?.assets ?? 0n,
      };
    },
  });

  const earnethUsd = useWstethUsd(
    earnBalancesQuery.data?.earnethInWsteth,
    CHAINS.Mainnet,
  );
  const earnusdUsd = useUsdcToUsd(earnBalancesQuery.data?.earnusdInUsdc);

  return {
    earneth: earnBalancesQuery.data?.earneth,
    earnusd: earnBalancesQuery.data?.earnusd,
    earnethUsd: earnethUsd.usdAmount,
    earnusdUsd: earnusdUsd.usdAmount,
    isLoading: earnBalancesQuery.isLoading,
    // earnUSD is valued 1:1 in USDC, only earnETH waits for a price
    isPriceLoading: !!earnBalancesQuery.data?.earneth && earnethUsd.isLoading,
    isError: earnBalancesQuery.isError,
  };
};
