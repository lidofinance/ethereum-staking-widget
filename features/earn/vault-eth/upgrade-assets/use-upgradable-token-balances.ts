import { useQuery } from '@tanstack/react-query';
import { usePublicClient } from 'wagmi';
import { erc20abi } from '@lidofinance/lido-ethereum-sdk/erc20';

import { getTokenAddress } from 'config/networks/token-address';
import { TOKENS } from 'consts/tokens';
import { useDappStatus } from 'modules/web3';
import { useGGVUserShareState } from 'features/earn/vault-ggv/withdraw/hooks/use-ggv-shares-state';
import { useIsUnlocked } from 'features/earn/vault-ggv/withdraw/hooks/use-is-unlocked';
import { ETH_VAULT_QUERY_SCOPE } from '../consts';

export const UPGRADABLE_TOKEN_BALANCES_QUERY_KEY = 'upgradable-token-balances';

export const useUpgradableTokenBalances = () => {
  const { address, chainId, isDappActive } = useDappStatus();
  const enabled = isDappActive && !!address;
  const publicClient = usePublicClient({ chainId });

  const ggvShareStateQuery = useGGVUserShareState();
  const areGgvSharesTimeLocked = useIsUnlocked(
    Number(ggvShareStateQuery.data?.shareUnlockTime ?? 0),
  );

  const ggAddress = getTokenAddress(chainId, TOKENS.gg);
  const strethAddress = getTokenAddress(chainId, TOKENS.streth);
  const dvstethAddress = getTokenAddress(chainId, TOKENS.dvsteth);

  const { data, isLoading, refetch } = useQuery({
    queryKey: [
      ETH_VAULT_QUERY_SCOPE,
      UPGRADABLE_TOKEN_BALANCES_QUERY_KEY,
      address,
      chainId,
    ],
    enabled: enabled && !!publicClient,
    queryFn: async () => {
      // TODO: refactor, note that skipToken (possible solution) doesn't work with refetch
      // This condition is a guard for TS only, because this condition is already handled by `enabled`
      if (!publicClient || !address) return null;

      const readBalance = (tokenAddress: typeof ggAddress) =>
        tokenAddress
          ? publicClient.readContract({
              abi: erc20abi,
              address: tokenAddress,
              functionName: 'balanceOf',
              args: [address],
            })
          : Promise.resolve(undefined);

      const [gg, streth, dvsteth] = await Promise.all([
        readBalance(ggAddress),
        readBalance(strethAddress),
        readBalance(dvstethAddress),
      ]);

      return { gg, streth, dvsteth };
    },
  });

  return {
    balances: {
      [TOKENS.gg]: areGgvSharesTimeLocked ? 0n : data?.gg, // if GGV shares are time-locked, we consider the balance as 0 for upgrade purposes
      [TOKENS.streth]: data?.streth,
      [TOKENS.dvsteth]: data?.dvsteth,
    },
    isLoading,
    refetchBalances: refetch,
  };
};
