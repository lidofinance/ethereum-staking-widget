import { formatEther } from 'viem';
import invariant from 'tiny-invariant';
import type { LIDO_CONTRACT_NAMES } from '@lidofinance/lido-ethereum-sdk/common';
import { useQuery } from '@tanstack/react-query';

import { STRATEGY_CONSTANT } from 'consts/react-query-strategies';
import { useLidoSDK, useContractAddress } from 'modules/web3';

export const useProtocolFee = () => {
  const { core } = useLidoSDK();
  const { data: stakingRouterAddress } = useContractAddress(
    'stakingRouter' as LIDO_CONTRACT_NAMES,
  );

  const queryResult = useQuery({
    queryKey: [
      'staking-fee-aggregate-distribution',
      core.chainId,
      stakingRouterAddress,
    ],
    ...STRATEGY_CONSTANT,
    refetchInterval: 60000, // 1 minute
    enabled: !!core.chainId && !!stakingRouterAddress,
    queryFn: async () => {
      invariant(
        stakingRouterAddress,
        '[useProtocolFee] The "staking Router Address" must be define',
      );

      return await core.rpcProvider.readContract({
        address: stakingRouterAddress,
        abi: [
          {
            inputs: [],
            name: 'getStakingFeeAggregateDistribution',
            outputs: [
              { internalType: 'uint256', name: 'modulesFee', type: 'uint256' },
              { internalType: 'uint256', name: 'treasuryFee', type: 'uint256' },
            ],
            stateMutability: 'view',
            type: 'function',
          },
        ],
        functionName: 'getStakingFeeAggregateDistribution',
      });
    },
  });

  const modulesFee = queryResult?.data?.[0] ?? undefined;
  const treasuryFee = queryResult?.data?.[1] ?? undefined;
  const totalFee =
    modulesFee && treasuryFee ? modulesFee + treasuryFee : undefined;

  // Converts numerical wei to a string representation of ether
  const totalFeeString = totalFee
    ? Number(formatEther(totalFee)).toFixed(0)
    : undefined;

  return {
    modulesFee,
    treasuryFee,
    totalFee,
    totalFeeString,
    ...queryResult,
  };
};
