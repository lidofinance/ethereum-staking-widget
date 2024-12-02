import { formatEther } from 'viem';
import type { LIDO_CONTRACT_NAMES } from '@lidofinance/lido-ethereum-sdk/common';
import { useQuery } from '@tanstack/react-query';

import { PartialStakingRouterAbi } from 'abi/partial-staking-router';
import { STRATEGY_CONSTANT } from 'consts/react-query-strategies';
import { useLidoSDK } from 'modules/web3';

export const useProtocolFee = () => {
  const { core } = useLidoSDK();

  const queryResult = useQuery({
    queryKey: ['staking-fee-aggregate-distribution', core.chainId],
    ...STRATEGY_CONSTANT,
    refetchInterval: 60000, // 1 minute
    enabled: !!core.chainId,
    queryFn: async () => {
      const address = await core.getContractAddress(
        'stakingRouter' as LIDO_CONTRACT_NAMES,
      );

      return await core.rpcProvider.readContract({
        address,
        abi: PartialStakingRouterAbi,
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
