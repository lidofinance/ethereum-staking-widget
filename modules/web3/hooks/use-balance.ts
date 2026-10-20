import { useCallback, useEffect, useMemo, useState } from 'react';
import { type QueryKey, useQueryClient } from '@tanstack/react-query';
import { erc20Abi, type Address, type WatchContractEventOnLogsFn } from 'viem';
import {
  useBalance,
  useReadContract,
  useWatchContractEvent,
  useConnection,
} from 'wagmi';
import type { GetBalanceData } from 'wagmi/query';

import { useDappStatus, useLidoSDK } from 'modules/web3';
import { config } from 'config';
import { getTokenAddress } from 'config/networks/token-address';
import { Token, TOKEN_SYMBOLS } from 'consts/tokens';
import { useStableToUsd } from 'shared/hooks/use-stable-to-usd';
import { getTokenDecimals } from 'utils/token-decimals';

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

export const useTokenBalance = (
  contractAddress?: Address,
  address?: Address,
  shouldSubscribe = true,
) => {
  const { chainId } = useDappStatus();
  const { subscribeToTokenUpdates } = useLidoSDK();

  const enabled = !!(address && contractAddress);

  const balanceQuery = useReadContract({
    abi: erc20Abi,
    address: contractAddress,
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
    if (shouldSubscribe && enabled && address && contractAddress) {
      return subscribeToTokenUpdates({
        tokenAddress: contractAddress,
        queryKey: balanceQuery.queryKey,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    address,
    enabled,
    contractAddress,
    shouldSubscribe,
    subscribeToTokenUpdates,
  ]);

  return balanceQuery;
};

export const useStethBalance = ({
  account,
  shouldSubscribeToUpdates = true,
}: UseBalanceProps = {}) => {
  const { chainId, address, isChainMatched } = useDappStatus();

  const mergedAccount = account ?? address;
  const enabled = !!mergedAccount && isChainMatched;

  const tokenAddress = enabled ? getTokenAddress(chainId, 'stETH') : undefined;

  const balanceData = useTokenBalance(
    tokenAddress,
    mergedAccount,
    shouldSubscribeToUpdates,
  );

  return {
    ...balanceData,
    tokenAddress: tokenAddress,
    isLoading: balanceData.isLoading,
  };
};

export const useWstethBalance = ({
  account,
  shouldSubscribeToUpdates = true,
}: UseBalanceProps = {}) => {
  const { address, chainId, isChainMatched } = useDappStatus();
  const mergedAccount = account ?? address;

  const enabled = !!mergedAccount && isChainMatched;

  const tokenAddress = enabled ? getTokenAddress(chainId, 'wstETH') : undefined;

  const balanceData = useTokenBalance(
    tokenAddress,
    mergedAccount,
    shouldSubscribeToUpdates,
  );

  return {
    ...balanceData,
    tokenAddress: tokenAddress,
    isLoading: balanceData.isLoading,
  };
};

export const useWethBalance = ({
  account,
  shouldSubscribeToUpdates = true,
}: UseBalanceProps = {}) => {
  const { address, chainId, isChainMatched } = useDappStatus();
  const mergedAccount = account ?? address;

  const enabled = !!mergedAccount && isChainMatched;

  const tokenAddress = enabled ? getTokenAddress(chainId, 'WETH') : undefined;

  const balanceData = useTokenBalance(
    tokenAddress,
    mergedAccount,
    shouldSubscribeToUpdates,
  );

  return {
    ...balanceData,
    tokenAddress: tokenAddress,
    isLoading: balanceData.isLoading,
  };
};

export const useStablecoinBalance = ({
  token,
  account,
  shouldSubscribeToUpdates = true,
}: {
  token: Extract<Token, 'usdc' | 'usdt' | 'usde'>;
  account?: Address;
  shouldSubscribeToUpdates?: boolean;
}) => {
  const { address, chainId, isChainMatched } = useDappStatus();
  const mergedAccount = account ?? address;

  const enabled = !!mergedAccount && isChainMatched;

  const tokenAddress = enabled
    ? getTokenAddress(chainId, TOKEN_SYMBOLS[token])
    : undefined;

  const balanceData = useTokenBalance(
    tokenAddress,
    mergedAccount,
    shouldSubscribeToUpdates,
  );

  const decimals = getTokenDecimals(token);
  const { stableAmount, usdAmount } = useStableToUsd(
    balanceData.data,
    decimals,
  );

  return {
    ...balanceData,
    usdcAmount: stableAmount,
    stableAmount,
    usdAmount,
    tokenAddress: tokenAddress,
    isLoading: balanceData.isLoading,
  };
};
