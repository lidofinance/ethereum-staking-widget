import { usePublicClient } from 'wagmi';
import { useQuery } from '@tanstack/react-query';
import { LidoSDKWrap } from '@lidofinance/lido-ethereum-sdk/wrap';
import type { PublicClient } from 'viem';

import { ONE_wstETH, useDappStatus } from 'modules/web3';
import { useEthUsd } from './use-eth-usd';

export const useWstethUsd = (amountWsteth?: bigint, chainId?: number) => {
  const { chainId: dappChainId } = useDappStatus();
  const derivedChainId = chainId ?? dappChainId;

  const publicClient = usePublicClient({ chainId: derivedChainId });
  const stethQuery = useQuery({
    queryKey: ['wsteth-steth-rate', { chainId: derivedChainId }],
    enabled: !!publicClient,
    queryFn: async () => {
      const wrap = new LidoSDKWrap({
        chainId: derivedChainId,
        logMode: 'none',
        rpcProvider: publicClient as PublicClient,
      });

      const wstethToStethRate = await wrap.convertWstethToSteth(ONE_wstETH);

      return {
        wstethToStethRate,
        decimals: ONE_wstETH,
      };
    },
    select: ({ wstethToStethRate, decimals }) => {
      if (amountWsteth === undefined) {
        return undefined;
      }
      if (amountWsteth == 0n) {
        return 0n;
      }
      return (amountWsteth * wstethToStethRate) / decimals;
    },
  });

  const usdQuery = useEthUsd(stethQuery.data);

  return {
    usdAmount: usdQuery.usdAmount,
    ethAmount: stethQuery.data,
    isLoading: stethQuery.isLoading || usdQuery.isLoading,
  };
};
