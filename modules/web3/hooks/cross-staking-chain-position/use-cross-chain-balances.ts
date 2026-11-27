import { useCallback, useMemo } from 'react';
import invariant from 'tiny-invariant';
import { useQuery, useQueryClient, type QueryKey } from '@tanstack/react-query';
import { erc20Abi, type Address } from 'viem';
import { useConfig, useConnection, type Config } from 'wagmi';
import { getPublicClient } from 'wagmi/actions';

import { config } from 'config';
import { TOKENS } from 'consts/tokens';

import { getPositionSlots, type PositionSlot } from './token-list';
import type { PositionConverters } from './use-position-converters';

export type CrossStakingChainPositionToken = PositionSlot & {
  balance: bigint;
  // undefined when a rate on the token's path failed or is still loading
  ethValue?: bigint;
  usdValue?: number;
};

export type CrossStakingChainPosition = {
  tokens: CrossStakingChainPositionToken[];
  // sum over tokens with a known ethValue
  totalEthValue: bigint;
  totalUsdValue?: number;
};

type BalanceReadResult = (bigint | undefined)[];

const readSlotBalance = (
  wagmiConfig: Config,
  slot: PositionSlot,
  account: Address,
) => {
  const client = getPublicClient(wagmiConfig, { chainId: slot.chainId });
  invariant(client, `No public client for chain ${slot.chainId}`);

  return slot.token === TOKENS.eth
    ? client.getBalance({ address: account })
    : client.readContract({
        address: slot.tokenAddress,
        abi: erc20Abi,
        functionName: 'balanceOf',
        args: [account],
      });
};

/**
 * Plain `eth_getBalance` and token `balanceOf` calls, no multicall: api/rpc
 * only lets `eth_call` reach allowlisted contracts, and a generic aggregator
 * would open it to arbitrary reads. Calls fired in the same tick are packed
 * by the transport's JSON-RPC batching, one POST per chain.
 *
 * A failed read keeps its `previous` value (undefined if it never loaded).
 * Only a pass where every read fails rejects, so the query can retry.
 */
const readBalances = async (
  wagmiConfig: Config,
  slots: readonly PositionSlot[],
  account: Address,
  previous?: BalanceReadResult,
): Promise<BalanceReadResult> => {
  const settled = await Promise.allSettled(
    slots.map((slot) => readSlotBalance(wagmiConfig, slot, account)),
  );

  const failure = settled.find((read) => read.status === 'rejected');
  if (failure && settled.every((read) => read.status === 'rejected')) {
    throw failure.reason;
  }

  return settled.map((read, index) =>
    read.status === 'fulfilled' ? read.value : previous?.[index],
  );
};

type UseCrossChainBalancesArgs = Pick<
  PositionConverters,
  'toEth' | 'ethToUsd'
> & {
  chainIds: readonly number[];
};

/**
 * ETH, WETH, stETH and wstETH balances of the connected account on every
 * chain in `chainIds`, read in one query.
 * Tokens a chain has no address for are skipped; a read that never
 * succeeded is dropped rather than shown as zero. Tokens come in
 * chain/token config order; sorting is a view concern of the caller.
 *
 * The key sits under `['balance']`, so tx flows that refresh account reads
 * (ACCOUNT_READ_QUERY_KEYS) refresh the position too.
 *
 * `refetchPosition()` refetches every chain; `refetchPosition(chainId)`
 * re-reads only that chain and patches its slots into the cached result.
 */
export const useCrossChainBalances = ({
  toEth,
  ethToUsd,
  chainIds,
}: UseCrossChainBalancesArgs) => {
  const { address } = useConnection();
  const wagmiConfig = useConfig();
  const queryClient = useQueryClient();

  const slots = useMemo(() => getPositionSlots(chainIds), [chainIds]);

  const queryKey = useMemo<QueryKey>(
    () => [
      'balance',
      'cross-staking-chain-position',
      { account: address, chainIds },
    ],
    [address, chainIds],
  );

  const select = useCallback(
    (results: BalanceReadResult): CrossStakingChainPosition => {
      let totalEthValue = 0n;

      const tokens = slots.flatMap(
        (slot, index): CrossStakingChainPositionToken[] => {
          const balance = results[index];
          if (balance === undefined) return [];

          const ethValue = toEth(slot.token, balance, slot.chainId);
          if (ethValue !== undefined) totalEthValue += ethValue;

          return [
            {
              ...slot,
              balance,
              ethValue,
              usdValue: ethValue === undefined ? undefined : ethToUsd(ethValue),
            },
          ];
        },
      );

      return {
        tokens,
        totalEthValue,
        // from the ETH total, not a sum of per-token floats
        totalUsdValue: ethToUsd(totalEthValue),
      };
    },
    [slots, toEth, ethToUsd],
  );

  const query = useQuery({
    queryKey,
    enabled: !!address && slots.length > 0,
    queryFn: () => {
      invariant(address, 'Account is required');
      return readBalances(
        wagmiConfig,
        slots,
        address,
        queryClient.getQueryData<BalanceReadResult>(queryKey),
      );
    },
    select,
    staleTime: config.PROVIDER_POLLING_INTERVAL * 2,
    refetchInterval: config.PROVIDER_POLLING_INTERVAL * 2,
  });

  const { refetch } = query;

  const refetchPosition = useCallback(
    async (chainId?: number) => {
      const cached = queryClient.getQueryData<BalanceReadResult>(queryKey);
      // nothing to patch yet: a full fetch is the only option
      if (chainId === undefined || !cached || !address) {
        await refetch();
        return;
      }

      const indexes = slots.flatMap((slot, index) =>
        slot.chainId === chainId ? [index] : [],
      );
      if (indexes.length === 0) return;

      const results = await readBalances(
        wagmiConfig,
        indexes.map((index) => slots[index]),
        address,
        indexes.map((index) => cached[index]),
      );

      queryClient.setQueryData<BalanceReadResult>(queryKey, (old) => {
        if (!old) return old;
        const next = [...old];
        indexes.forEach((slotIndex, resultIndex) => {
          next[slotIndex] = results[resultIndex];
        });
        return next;
      });
    },
    [address, queryClient, queryKey, refetch, slots, wagmiConfig],
  );

  return { ...query, refetchPosition };
};
