import { useQueryClient } from '@tanstack/react-query';
import { BigNumber } from 'ethers';
import { useCallback, useMemo } from 'react';
import { Address, WatchContractEventOnLogsFn } from 'viem';
import { useReadContract, useWatchContractEvent } from 'wagmi';

const nativeToBN = (data: bigint) => BigNumber.from(data.toString());

const Erc20AllowanceAbi = [
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
] as const;

type OnLogsFn = WatchContractEventOnLogsFn<
  typeof Erc20AllowanceAbi,
  'Transfer' | 'Approval',
  true
>;

type UseAllowanceProps = {
  token: Address;
  account: Address;
  spender: Address;
};

export const useAllowance = ({
  token,
  account,
  spender,
}: UseAllowanceProps) => {
  const queryClient = useQueryClient();
  const enabled = !!(token && account && spender);

  const allowanceQuery = useReadContract({
    abi: Erc20AllowanceAbi,
    address: token,
    functionName: 'allowance',
    args: [account, spender],
    query: { enabled, select: nativeToBN },
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
    [account, spender, token],
  );

  useWatchContractEvent({
    abi: Erc20AllowanceAbi,
    eventName: 'Approval',
    batch: true,
    poll: true,
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
  });

  useWatchContractEvent({
    abi: Erc20AllowanceAbi,
    eventName: 'Transfer',
    batch: false,
    poll: true,
    args: useMemo(
      () => ({
        from: account,
      }),
      [account],
    ),
    address: token,
    enabled,
    onLogs,
  });

  return allowanceQuery;
};
