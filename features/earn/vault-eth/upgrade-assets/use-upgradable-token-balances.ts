import invariant from 'tiny-invariant';
import { useCallback, useMemo } from 'react';
import { queryOptions, useQuery, useQueryClient } from '@tanstack/react-query';
import { erc20abi } from '@lidofinance/lido-ethereum-sdk/erc20';

import { getTokenAddress } from 'config/networks/token-address';
import { TOKENS } from 'consts/tokens';
import { useDappStatus, useMainnetOnlyWagmi } from 'modules/web3';
import { useGGVUserShareState } from 'features/earn/vault-ggv/withdraw/hooks/use-ggv-shares-state';
import { useIsUnlocked } from 'features/earn/vault-ggv/withdraw/hooks/use-is-unlocked';
import { ETH_VAULT_QUERY_SCOPE } from '../consts';

import { getLegacyAsyncDepositQueueContract } from '../contracts';
import { EthDepositToken } from '../types';
import { useEthVaultAvailable } from '../hooks/use-vault-available';
import { getSTGVaultContract } from 'features/earn/vault-stg/contracts';

export const UPGRADABLE_TOKEN_BALANCES_QUERY_KEY = 'upgradable-token-balances';

export const useUpgradableTokenBalances = () => {
  const { address, chainId, isDappActive } = useDappStatus();
  const enabled = isDappActive && !!address;
  const { publicClientMainnet } = useMainnetOnlyWagmi();
  const vaultAvailable = useEthVaultAvailable();
  const queryClient = useQueryClient();

  const ggvShareStateQuery = useGGVUserShareState();
  const areGgvSharesTimeLocked = useIsUnlocked(
    Number(ggvShareStateQuery.data?.shareUnlockTime ?? 0),
  );

  // The options are shared with `fetchBalances` below, so a fetch started for
  // one account cannot resolve with another's result: the observer's own
  // `refetch` follows the current key, which moves when the account switches
  // Memoized on its inputs: the options are a dependency of `fetchBalances`
  // and, through it, of `upgrade`, which must keep their identity
  const balancesQuery = useMemo(
    () =>
      queryOptions({
        queryKey: [
          ETH_VAULT_QUERY_SCOPE,
          UPGRADABLE_TOKEN_BALANCES_QUERY_KEY,
          address,
          chainId,
        ],
        queryFn: async () => {
          invariant(publicClientMainnet, 'Public client is not defined');
          invariant(address, 'Address is not defined');

          const ggAddress = getTokenAddress(chainId, TOKENS.gg);
          const strethAddress = getTokenAddress(chainId, TOKENS.streth);
          const dvstethAddress = getTokenAddress(chainId, TOKENS.dvsteth);

          const stgVault = getSTGVaultContract(publicClientMainnet);

          invariant(ggAddress, 'GG token address is not defined');
          invariant(strethAddress, 'stETH token address is not defined');
          invariant(dvstethAddress, 'dvstETH token address is not defined');

          const readBalance = (tokenAddress: typeof ggAddress) =>
            publicClientMainnet.readContract({
              abi: erc20abi,
              address: tokenAddress,
              functionName: 'balanceOf',
              args: [address],
            });

          const readIsRequestInQueue = async (token: EthDepositToken) => {
            const contract = getLegacyAsyncDepositQueueContract({
              publicClient: publicClientMainnet,
              token,
            });

            const [_timestamp, assets] = await contract.read.requestOf([
              address,
            ]);

            if (assets > 0n) {
              const isClaimable = await contract.read.claimableOf([address]);
              return isClaimable === 0n;
            } else {
              return false;
            }
          };

          const [
            gg,
            strethActiveShares,
            dvsteth,
            isGgRequestInQueue,
            isStrethRequestInQueue,
            isDvstethRequestInQueue,
            strethClaimableShares,
          ] = await Promise.all([
            readBalance(ggAddress),
            readBalance(strethAddress),
            readBalance(dvstethAddress),
            readIsRequestInQueue(TOKENS.gg),
            readIsRequestInQueue(TOKENS.streth),
            readIsRequestInQueue(TOKENS.dvsteth),
            stgVault.read.claimableSharesOf([address]),
          ]);

          return {
            gg: isGgRequestInQueue ? 0n : gg,
            streth: isStrethRequestInQueue
              ? 0n
              : strethActiveShares + strethClaimableShares,
            dvsteth: isDvstethRequestInQueue ? 0n : dvsteth,
          };
        },
      }),
    [address, chainId, publicClientMainnet],
  );

  const { data, isLoading } = useQuery({
    ...balancesQuery,
    enabled:
      enabled && !!publicClientMainnet && vaultAvailable.isDepositEnabled,
  });

  // A fresh read for the account and chain of this render, whatever the
  // connection does meanwhile
  const fetchBalances = useCallback(
    () => queryClient.fetchQuery({ ...balancesQuery, staleTime: 0 }),
    [queryClient, balancesQuery],
  );

  return {
    balances: {
      [TOKENS.gg]: areGgvSharesTimeLocked ? 0n : data?.gg, // if GGV shares are time-locked, we consider the balance as 0 for upgrade purposes
      [TOKENS.streth]: data?.streth,
      [TOKENS.dvsteth]: data?.dvsteth,
    },
    isLoading,
    fetchBalances,
  };
};
