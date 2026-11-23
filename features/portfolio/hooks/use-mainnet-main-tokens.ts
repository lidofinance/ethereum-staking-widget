import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { erc20Abi, parseEther, type Address } from 'viem';
import invariant from 'tiny-invariant';

import { useMainnetOnlyWagmi } from 'modules/web3';
import { CHAINS } from 'consts/chains';
import { TOKENS } from 'consts/tokens';
import { STRATEGY_LAZY } from 'consts/react-query-strategies';
import { getTokenAddress } from 'config/networks/token-address';
import { useEthUsd } from 'shared/hooks/use-eth-usd';

import { PORTFOLIO_QUERY_SCOPE } from '../consts';
import { buildMainTokens, type MainTokenBalances } from '../utils';

const ONE_ETH = parseEther('1');

// stands in for the portfolio API while it has no answer for the wallet
export const useMainnetMainTokens = (address?: Address, enabled = true) => {
  const { publicClientMainnet } = useMainnetOnlyWagmi();
  const isEnabled = enabled && !!address && !!publicClientMainnet;

  const balancesQuery = useQuery({
    queryKey: [
      PORTFOLIO_QUERY_SCOPE,
      'mainnet-main-tokens',
      { address },
    ] as const,
    enabled: isEnabled,
    ...STRATEGY_LAZY,
    queryFn: async (): Promise<MainTokenBalances> => {
      invariant(address, 'No address provided');
      const readBalance = (token: 'weth' | 'usdc' | 'usdt') => {
        const tokenAddress = getTokenAddress(CHAINS.Mainnet, token);
        invariant(tokenAddress, `No mainnet address for ${token}`);
        return publicClientMainnet.readContract({
          address: tokenAddress,
          abi: erc20Abi,
          functionName: 'balanceOf',
          args: [address],
        });
      };
      const [eth, weth, usdc, usdt] = await Promise.all([
        publicClientMainnet.getBalance({ address }),
        readBalance(TOKENS.weth),
        readBalance(TOKENS.usdc),
        readBalance(TOKENS.usdt),
      ]);
      return { eth, weth, usdc, usdt };
    },
  });

  const ethPrice = useEthUsd(isEnabled ? ONE_ETH : undefined);

  const tokens = useMemo(
    () =>
      balancesQuery.data
        ? buildMainTokens(balancesQuery.data, ethPrice.usdAmount)
        : [],
    [balancesQuery.data, ethPrice.usdAmount],
  );

  return {
    tokens,
    isLoading: isEnabled && (balancesQuery.isLoading || ethPrice.isLoading),
    isError: balancesQuery.isError,
  };
};
