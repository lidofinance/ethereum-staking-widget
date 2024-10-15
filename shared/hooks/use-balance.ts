/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { QueryKey, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AbstractLidoSDKErc20 } from '@lidofinance/lido-ethereum-sdk/erc20';
import { BigNumber } from 'ethers';
import { useLidoSDK } from 'providers/lido-sdk';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Address, WatchContractEventOnLogsFn } from 'viem';
import {
  useBlockNumber,
  useBalance,
  useAccount,
  useReadContract,
  useWatchContractEvent,
} from 'wagmi';
import type { GetBalanceData } from 'wagmi/query';

import { config } from 'config';
import { useCurrentSupportedChain } from 'providers/supported-chain';
import { useDappStatus } from './use-dapp-status';

const nativeToBN = (data: bigint) => BigNumber.from(data.toString());

const balanceToBN = (data: GetBalanceData) => nativeToBN(data.value);

export const useEthereumBalance = () => {
  const queryClient = useQueryClient();
  const { chainId } = useDappStatus();
  const { address } = useAccount();
  const { data: blockNumber } = useBlockNumber({
    watch: {
      poll: true,
      pollingInterval: config.PROVIDER_POLLING_INTERVAL,
      enabled: !!address,
    },
    chainId,
    cacheTime: config.PROVIDER_POLLING_INTERVAL,
  });

  const queryData = useBalance({
    address,
    chainId,
    query: {
      select: balanceToBN,
      // because we subscribe to block
      staleTime: Infinity,
      enabled: !!address,
    },
  });

  useEffect(() => {
    void queryClient.invalidateQueries(
      { queryKey: queryData.queryKey },
      // this tells RQ to not force another refetch if this query is already revalidating
      // dedups rpc requests
      { cancelRefetch: false },
    );

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blockNumber]);

  return queryData;
};

type TokenContract = Awaited<
  ReturnType<InstanceType<typeof AbstractLidoSDKErc20>['getContract']>
>;

type TokenSubscriptionState = Record<
  Address,
  {
    subscribers: number;
    queryKey: QueryKey;
  }
>;

type SubscribeArgs = {
  tokenAddress: Address;
  queryKey: QueryKey;
};

type UseBalanceProps = {
  account?: Address;
  shouldSubscribeToUpdates?: boolean;
};

export const Erc20EventsAbi = [
  {
    type: 'event',
    name: 'Transfer',
    inputs: [
      { indexed: true, name: 'from', type: 'address' },
      { indexed: true, name: 'to', type: 'address' },
      { indexed: false, name: 'value', type: 'uint256' },
    ],
  },
] as const;

type OnLogsFn = WatchContractEventOnLogsFn<
  typeof Erc20EventsAbi,
  'Transfer',
  true
>;

const onError = (error: unknown) =>
  console.warn(
    '[useTokenTransferSubscription] error while watching events',
    error,
  );

export const useTokenTransferSubscription = () => {
  const { address } = useAccount();
  const queryClient = useQueryClient();
  const [subscriptions, setSubscriptions] = useState<TokenSubscriptionState>(
    {},
  );

  const tokens = useMemo(
    () => Object.keys(subscriptions) as Address[],
    [subscriptions],
  );

  const onLogs: OnLogsFn = useCallback(
    (logs) => {
      for (const log of logs) {
        const subscription =
          subscriptions[log.address.toLowerCase() as Address];
        if (!subscription) continue;
        // we could optimistically update balance data
        // but it's easier to refetch balance after transfer
        void queryClient.invalidateQueries(
          {
            queryKey: subscription.queryKey,
          },
          { cancelRefetch: false },
        );
      }
    },
    [queryClient, subscriptions],
  );

  const shouldWatch = !!(address && tokens.length > 0);

  useWatchContractEvent({
    abi: Erc20EventsAbi,
    eventName: 'Transfer',
    batch: true,
    poll: true,
    args: useMemo(
      () => ({
        to: address,
      }),
      [address],
    ),
    address: tokens,
    enabled: shouldWatch,
    onLogs,
    onError,
  });

  useWatchContractEvent({
    abi: Erc20EventsAbi,
    eventName: 'Transfer',
    batch: true,
    poll: true,
    args: useMemo(
      () => ({
        from: address,
      }),
      [address],
    ),
    address: tokens,
    enabled: shouldWatch,
    onLogs,
    onError,
  });

  const subscribe = useCallback(
    ({ tokenAddress: _tokenAddress, queryKey }: SubscribeArgs) => {
      const tokenAddress = _tokenAddress.toLowerCase() as Address;
      setSubscriptions((old) => {
        const existing = old[tokenAddress];
        return {
          ...old,
          [tokenAddress]: {
            queryKey,
            subscribers: existing?.subscribers ?? 0 + 1,
          },
        };
      });

      // returns unsubscribe to be used as useEffect return fn (for unmount)
      return () => {
        setSubscriptions((old) => {
          const existing = old[tokenAddress];
          if (!existing) return old;
          if (existing.subscribers > 1) {
            return {
              ...old,
              [tokenAddress]: {
                ...existing,
                subscribers: existing.subscribers - 1,
              },
            };
          } else {
            delete old[tokenAddress];
            return { ...old };
          }
        });
      };
    },
    [],
  );

  return subscribe;
};

// NB: contract can be undefined but for better wagmi typings is casted as NoNNullable
const useTokenBalance = (
  contract: TokenContract,
  address?: Address,
  shouldSubscribe = true,
) => {
  const { isSupportedChain } = useDappStatus();
  const chainId = useCurrentSupportedChain();
  const { subscribeToTokenUpdates } = useLidoSDK();

  const enabled = !!address && isSupportedChain;

  const balanceQuery = useReadContract({
    abi: contract?.abi,
    address: contract?.address,
    chainId,
    functionName: 'balanceOf',
    args: address && [address],
    query: {
      enabled,
      select: nativeToBN,
      // because we update on events we can have high staleTime
      // this prevents loader when changing pages
      staleTime: 30_000,
    },
  });

  useEffect(() => {
    if (shouldSubscribe && enabled && address && contract?.address) {
      return subscribeToTokenUpdates({
        tokenAddress: contract.address,
        queryKey: balanceQuery.queryKey,
      });
    }
    // queryKey causes rerender
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, enabled, contract?.address]);

  return balanceQuery;
};

export const useStethBalance = ({
  account,
  shouldSubscribeToUpdates = true,
}: UseBalanceProps = {}) => {
  const { core, l2, stETH, isL2 } = useLidoSDK();
  const { isSupportedChain } = useDappStatus();
  const { address } = useAccount();

  const mergedAccount = account ?? address;

  const { data: contract, isLoading } = useQuery({
    queryKey: ['steth-contract', core.chainId, isL2],
    enabled: !!mergedAccount && isSupportedChain,

    staleTime: Infinity,
    queryFn: async () => (isL2 ? l2.steth.getContract() : stETH.getContract()),
  });

  const balanceData = useTokenBalance(
    contract!,
    mergedAccount,
    shouldSubscribeToUpdates,
  );

  return {
    ...balanceData,
    tokenAddress: contract ? contract.address : undefined,
    isLoading: isLoading || balanceData.isLoading,
  };
};

export const useWstethBalance = ({
  account,
  shouldSubscribeToUpdates = true,
}: UseBalanceProps = {}) => {
  const { address } = useAccount();
  const { isSupportedChain } = useDappStatus();
  const mergedAccount = account ?? address;
  const {
    core: lidoSDKCore,
    l2: lidoSDKL2,
    wstETH: lidoSDKwstETH,
    isL2,
  } = useLidoSDK();

  const { data: contract, isLoading } = useQuery({
    queryKey: ['wsteth-contract', lidoSDKCore.chainId, isL2],
    enabled: !!mergedAccount && isSupportedChain,
    staleTime: Infinity,
    queryFn: async () =>
      isL2 ? lidoSDKL2.wsteth.getContract() : lidoSDKwstETH.getContract(),
  });

  const balanceData = useTokenBalance(
    contract!,
    mergedAccount,
    shouldSubscribeToUpdates,
  );

  return {
    ...balanceData,
    tokenAddress: contract ? contract.address : undefined,
    isLoading: isLoading || balanceData.isLoading,
  };
};
