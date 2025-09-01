import { useCallback, useMemo } from 'react';
import { Address, WatchContractEventOnLogsFn } from 'viem';
import { useReadContract, useWatchContractEvent } from 'wagmi';
import { useQueryClient } from '@tanstack/react-query';

import { config } from 'config';

import { useDappStatus } from './use-dapp-status';

export const Erc20AllowanceAbi = [
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
  {
    constant: true,
    inputs: [
      {
        name: '_owner',
        type: 'address',
      },
      {
        name: '_spender',
        type: 'address',
      },
    ],
    name: 'allowance',
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

type OnLogsFn = WatchContractEventOnLogsFn<
  typeof Erc20AllowanceAbi,
  'Transfer' | 'Approval',
  true
>;

type UseAllowanceProps = {
  token?: Address;
  account?: Address;
  spender?: Address;
};

const onError = (error: unknown) =>
  console.warn('[useAllowance] error while watching events', error);

export const useAllowance = ({
  token,
  account,
  spender,
}: UseAllowanceProps) => {
  const { chainId, isChainMatched } = useDappStatus();
  const queryClient = useQueryClient();
  const enabled = !!(token && account && spender && isChainMatched);

  const allowanceQuery = useReadContract({
    abi: Erc20AllowanceAbi,
    address: token,
    functionName: 'allowance',
    chainId,
    args: [account, spender] as [Address, Address],
    query: {
      enabled,
      // because we update on events we can have high staleTime
      // this prevents loader when changing pages
      // but safes us from laggy user RPCs
      staleTime: config.PROVIDER_POLLING_INTERVAL * 2,
      refetchInterval: config.PROVIDER_POLLING_INTERVAL * 2,
    },
  });

  const onLogs: OnLogsFn = useCallback(
    () => {
      void queryClient.invalidateQueries(
        {
          queryKey: allowanceQuery.queryKey,
        },
        { cancelRefetch: false },
      );
    },
    // queryKey is unstable
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [chainId, account, spender, token],
  );

  useWatchContractEvent({
    abi: Erc20AllowanceAbi,
    eventName: 'Approval',
    poll: true,
    chainId,
    args: useMemo(
      () => ({
        owner: account,
        spender,
      }),
      [account, spender],
    ),
    address: token,
    enabled,
    onLogs,
    onError,
  });

  useWatchContractEvent({
    abi: Erc20AllowanceAbi,
    eventName: 'Transfer',
    poll: true,
    chainId,
    args: useMemo(
      () => ({
        from: account,
      }),
      [account],
    ),
    address: token,
    enabled,
    onLogs,
    onError,
  });

  return allowanceQuery;
};
