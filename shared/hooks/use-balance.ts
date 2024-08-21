/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { QueryKey, useQuery, useQueryClient } from '@tanstack/react-query';
import { BigNumber } from 'ethers';
import { useLidoSDK } from 'providers/lido-sdk';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  useBlockNumber,
  useBalance,
  useAccount,
  useReadContract,
  useWatchContractEvent,
} from 'wagmi';

import type { AbstractLidoSDKErc20 } from '@lidofinance/lido-ethereum-sdk/erc20';
import type { GetBalanceData } from 'wagmi/query';
import type { Address, Log } from 'viem';

const nativeToBN = (data: bigint) => BigNumber.from(data.toString());

const balanceToBN = (data: GetBalanceData) => nativeToBN(data.value);

export const useEthereumBalance = () => {
  const queryClient = useQueryClient();
  const { address } = useAccount();
  const { data: blockNumber } = useBlockNumber({ watch: !!address });
  const queryData = useBalance({
    address,
    query: { select: balanceToBN, staleTime: 7000, enabled: !!address },
  });

  useEffect(() => {
    void queryClient.invalidateQueries(
      { queryKey: queryData.queryKey },
      // this tells RQ to not force another refetch if this query is already revalidating
      // dedups rpc requests
      { cancelRefetch: false },
    );
  }, [blockNumber, queryClient, queryData.queryKey]);

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

  const onLogs = useCallback(
    (logs: Log[]) => {
      for (const log of logs) {
        const subscription = subscriptions[log.address];
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

  const shouldWatch = address && tokens.length > 0;

  useWatchContractEvent({
    abi: Erc20EventsAbi,
    eventName: 'Transfer',
    args: useMemo(
      () => ({
        to: address,
      }),
      [address],
    ),
    address: tokens,
    enabled: shouldWatch,
    onLogs,
  });

  useWatchContractEvent({
    abi: Erc20EventsAbi,
    eventName: 'Transfer',
    args: useMemo(
      () => ({
        from: address,
      }),
      [address],
    ),
    address: tokens,
    enabled: shouldWatch,
    onLogs,
  });

  const subscribe = useCallback(({ tokenAddress, queryKey }: SubscribeArgs) => {
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
  }, []);

  return subscribe;
};

// NB: contract can be undefined but for better wagmi typings is casted as NoNNullable
const useTokenBalance = (contract: TokenContract, address?: Address) => {
  const { subscribeToTokenUpdates } = useLidoSDK();

  const balanceQuery = useReadContract({
    abi: contract?.abi,
    address: contract?.address,
    functionName: 'balanceOf',
    args: address && [address],
    query: { enabled: !!address, select: nativeToBN },
  });

  useEffect(() => {
    if (address && contract?.address) {
      return subscribeToTokenUpdates({
        tokenAddress: contract.address,
        queryKey: balanceQuery.queryKey,
      });
    }
    // queryKey causes rerender
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, contract?.address]);

  return balanceQuery;
};

export const useStethBalance = () => {
  const { address } = useAccount();

  const { steth, core } = useLidoSDK();

  const { data: contract, isLoading } = useQuery({
    queryKey: ['steth-contract', core.chainId],
    enabled: !!address,
    staleTime: Infinity,
    queryFn: async () => steth.getContract(),
  });

  const balanceData = useTokenBalance(contract!, address);

  return { ...balanceData, isLoading: isLoading || balanceData.isLoading };
};

export const useWstethBalance = () => {
  const { address } = useAccount();

  const { wsteth, core } = useLidoSDK();

  const { data: contract, isLoading } = useQuery({
    queryKey: ['wsteth-contract', core.chainId],
    enabled: !!address,
    staleTime: Infinity,
    queryFn: async () => wsteth.getContract(),
  });

  const balanceData = useTokenBalance(contract!, address);

  return { ...balanceData, isLoading: isLoading || balanceData.isLoading };
};
