/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { BigNumber } from 'ethers';
import { useLidoSDK } from 'providers/lido-sdk';
import { useEffect } from 'react';
import {
  useBlockNumber,
  useBalance,
  useAccount,
  useReadContract,
  useWatchContractEvent,
} from 'wagmi';

import type { AbstractLidoSDKErc20 } from '@lidofinance/lido-ethereum-sdk/erc20';

import type { GetBalanceData } from 'wagmi/query';
import { Address } from 'viem';

const dataToBN = (data: GetBalanceData) =>
  BigNumber.from(data.value.toString());

const NativeToBN = (data: bigint) => BigNumber.from(data.toString());

export const useEthereumBalance = () => {
  const queryClient = useQueryClient();
  const { address } = useAccount();
  const { data: blockNumber } = useBlockNumber({ watch: !!address });
  const queryData = useBalance({
    address,
    query: { select: dataToBN, staleTime: 7000, enabled: !!address },
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

const useTokenBalance = (contract: TokenContract, address?: Address) => {
  const queryClient = useQueryClient();
  const balanceQuery = useReadContract({
    abi: contract?.abi,
    address: contract?.address,
    functionName: 'balanceOf',
    args: address && [address],
    query: { enabled: !!address, select: NativeToBN },
  });

  useWatchContractEvent({
    abi: contract?.abi,
    address: contract?.address,
    eventName: 'Transfer',
    poll: true,

    enabled: !!(address && balanceQuery.data),
    args: { from: address! },
    onLogs: () => {
      void queryClient.invalidateQueries(
        { queryKey: balanceQuery.queryKey },
        { cancelRefetch: false },
      );
    },
  });

  useWatchContractEvent({
    abi: contract?.abi,
    address: contract?.address,
    eventName: 'Transfer',
    poll: true,
    enabled: !!(address && balanceQuery.data),
    args: { to: address! },
    onLogs: () => {
      void queryClient.invalidateQueries(
        { queryKey: balanceQuery.queryKey },
        { cancelRefetch: false },
      );
    },
  });

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
