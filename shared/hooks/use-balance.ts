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
  address: Address;
  queryKey: QueryKey;
};

export const Erc20EventsAbi = [
  {
    type: 'event',
    name: 'Approval',
    inputs: [
      { indexed: true, name: 'owner', type: 'address' },
      { indexed: true, name: 'spender', type: 'address' },
      { indexed: false, name: 'value', type: 'uint256' },
    ],
  },
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
        if (subscription) {
          // we could optimistically update balance data
          // but it's easier to refetch balance after transfer
          void queryClient.invalidateQueries(
            {
              queryKey: subscription.queryKey,
            },
            { cancelRefetch: false },
          );
        }
      }
    },
    [queryClient, subscriptions],
  );

  const shouldWatch = address && tokens.length > 0;

  useWatchContractEvent({
    abi: Erc20EventsAbi,
    eventName: 'Transfer',
    batch: true,
    poll: true,
    args: {
      to: address,
    },
    address: tokens,
    enabled: shouldWatch,
    onLogs,
  });

  useWatchContractEvent({
    abi: Erc20EventsAbi,
    eventName: 'Transfer',
    batch: true,
    poll: true,
    args: {
      from: address,
    },
    address: tokens,
    enabled: shouldWatch,
    onLogs,
  });

  const subscribe = useCallback(({ address, queryKey }: SubscribeArgs) => {
    setSubscriptions((old) => {
      const existing = old[address];
      return {
        ...old,
        [address]: {
          queryKey,
          subscribers: existing?.subscribers ?? 0 + 1,
        },
      };
    });

    // unsubscribe
    return () => {
      setSubscriptions((old) => {
        const existing = old[address];
        if (existing) {
          if (existing.subscribers > 1) {
            return {
              ...old,
              [address]: {
                ...existing,
                subscribers: existing.subscribers - 1,
              },
            };
          } else {
            delete old[address];
            return { ...old };
          }
        } else return old;
      });
    };
  }, []);

  return subscribe;
};

// NB: contract can be undefined but for better wagmi typings is casted as NoNNullable
const useTokenBalance = (contract: TokenContract, address?: Address) => {
  const { subscribeToTokenUpdates } = useLidoSDK();
  // const queryClient = useQueryClient();
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
        address: contract.address,
        queryKey: balanceQuery.queryKey,
      });
    }
  }, [
    address,
    contract?.address,
    balanceQuery.queryKey,
    subscribeToTokenUpdates,
  ]);

  return balanceQuery;
};

export const useStethBalance = () => {
  const { address } = useAccount();

  const { steth, core } = useLidoSDK();

  const { data: contractData, isLoading } = useQuery({
    queryKey: ['steth-contract', core.chainId],
    enabled: !!address,
    staleTime: Infinity,
    queryFn: async () => steth.getContract(),
  });

  const contract = contractData as NonNullable<typeof contractData>;

  const balanceData = useTokenBalance(contract, address);

  return { ...balanceData, isLoading: isLoading || balanceData.isLoading };
};

export const useWstethBalance = () => {
  const { address } = useAccount();

  const { wsteth, core } = useLidoSDK();

  const { data: contractData, isLoading } = useQuery({
    queryKey: ['wsteth-contract', core.chainId],
    enabled: !!address,
    staleTime: Infinity,
    queryFn: async () => wsteth.getContract(),
  });

  const contract = contractData as NonNullable<typeof contractData>;

  const balanceData = useTokenBalance(contract, address);

  return { ...balanceData, isLoading: isLoading || balanceData.isLoading };
};
