import { useQuery } from '@tanstack/react-query';
import { erc20Abi, type Address } from 'viem';
import invariant from 'tiny-invariant';

import { useMainnetOnlyWagmi } from 'modules/web3';
import { CHAINS } from 'consts/chains';
import { TOKENS } from 'consts/tokens';
import { config } from 'config';
import { getTokenAddress } from 'config/networks/token-address';

import { PORTFOLIO_QUERY_SCOPE } from '../consts';

// read on Ethereum whatever chain the wallet is on
export const useMainnetTokenBalances = (address?: Address) => {
  const { publicClientMainnet } = useMainnetOnlyWagmi();

  return useQuery({
    queryKey: [PORTFOLIO_QUERY_SCOPE, 'mainnet-balances', { address }] as const,
    enabled: !!address && !!publicClientMainnet,
    staleTime: config.PROVIDER_POLLING_INTERVAL,
    refetchInterval: config.PROVIDER_POLLING_INTERVAL,
    queryFn: async () => {
      invariant(address, 'No address provided');
      const stethAddress = getTokenAddress(CHAINS.Mainnet, TOKENS.steth);
      const wstethAddress = getTokenAddress(CHAINS.Mainnet, TOKENS.wsteth);
      invariant(
        stethAddress && wstethAddress,
        'Mainnet token addresses are not configured',
      );

      const readBalance = (tokenAddress: Address) =>
        publicClientMainnet.readContract({
          address: tokenAddress,
          abi: erc20Abi,
          functionName: 'balanceOf',
          args: [address],
        });
      const [stethBalance, wstethBalance] = await Promise.all([
        readBalance(stethAddress),
        readBalance(wstethAddress),
      ]);
      return { steth: stethBalance, wsteth: wstethBalance };
    },
  });
};
