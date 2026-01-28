/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { type QueryKey, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  useBalance,
  useReadContract,
  useWatchContractEvent,
  useConnection,
} from 'wagmi';
import { erc20abi } from '@lidofinance/lido-ethereum-sdk/erc20';

import { useDappStatus, useLidoSDK, useLidoSDKL2 } from 'modules/web3';
import { config } from 'config';

import {
  getContract,
  type Address,
  type WatchContractEventOnLogsFn,
} from 'viem';
import type { GetBalanceData } from 'wagmi/query';
import type { AbstractLidoSDKErc20 } from '@lidofinance/lido-ethereum-sdk/erc20';
import { getTokenAddress } from 'config/networks/token-address';

const selectBalance = (data: GetBalanceData) => data.value;

export const useEthereumBalance = () => {
  const { chainId, address, isDappActive } = useDappStatus();

  const queryData = useBalance({
    address,
    chainId,
    query: {
      select: selectBalance,
      staleTime: config.PROVIDER_POLLING_INTERVAL,
      refetchInterval: config.PROVIDER_POLLING_INTERVAL,
      enabled: isDappActive,
    },
  });

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
  const { address } = useConnection();
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
  const { chainId } = useDappStatus();
  const { subscribeToTokenUpdates } = useLidoSDK();

  const enabled = !!(address && contract);

  const balanceQuery = useReadContract({
    abi: contract?.abi,
    address: contract?.address,
    chainId,
    functionName: 'balanceOf',
    args: address && [address],
    query: {
      enabled,
      // because we update on events we can have high staleTime
      // this prevents loader when changing pages
      // but safes us from laggy user RPCs
      staleTime: config.PROVIDER_POLLING_INTERVAL * 2,
      refetchInterval: config.PROVIDER_POLLING_INTERVAL * 2,
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
  const { chainId, address, isChainMatched } = useDappStatus();
  const { stETH } = useLidoSDK();
  const { l2, isL2 } = useLidoSDKL2();

  const mergedAccount = account ?? address;
  const enabled = !!mergedAccount && isChainMatched;

  const { data: contract, isLoading } = useQuery({
    queryKey: ['steth-contract', chainId, isL2],
    enabled,
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
  const { address, chainId, isChainMatched } = useDappStatus();
  const mergedAccount = account ?? address;
  const { wstETH } = useLidoSDK();
  const { l2, isL2 } = useLidoSDKL2();

  const enabled = !!mergedAccount && isChainMatched;

  const { data: contract, isLoading } = useQuery({
    queryKey: ['wsteth-contract', chainId, isL2],
    enabled,
    staleTime: Infinity,
    queryFn: () => (isL2 ? l2.wsteth.getContract() : wstETH.getContract()),
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

export const useWethBalance = ({
  account,
  shouldSubscribeToUpdates = true,
}: UseBalanceProps = {}) => {
  const { address, chainId, isChainMatched } = useDappStatus();
  const { core } = useLidoSDK();
  const mergedAccount = account ?? address;

  const enabled = !!mergedAccount && isChainMatched;

  const wethAddress = getTokenAddress(chainId, 'wETH');

  const contract =
    wethAddress && enabled
      ? getContract({
          address: wethAddress,
          client: core.rpcProvider,
          abi: erc20abi,
        })
      : undefined;

  const balanceData = useTokenBalance(
    contract as any,
    mergedAccount,
    shouldSubscribeToUpdates,
  );

  return {
    ...balanceData,
    tokenAddress: wethAddress,
    isLoading: balanceData.isLoading,
  };
};
