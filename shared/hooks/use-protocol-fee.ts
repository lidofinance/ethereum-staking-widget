import { formatEther } from 'viem';
import type { LIDO_CONTRACT_NAMES } from '@lidofinance/lido-ethereum-sdk/common';

import { STRATEGY_CONSTANT } from 'consts/react-query-strategies';
import { useLidoQuery } from 'shared/hooks/use-lido-query';
import { useLidoSDK } from 'modules/web3';
import { useContractAddress } from './use-contract-address';

export const useProtocolFee = () => {
  const { core } = useLidoSDK();
  const {
    data: stakingRouterAddress,
    isLoading: isAddressLoading,
    error: addressError,
    // TODO:
    //  import { LIDO_CONTRACT_NAMES } from '@lidofinance/lido-ethereum-sdk/common';
    //  ERROR: LIDO_CONTRACT_NAMES is undefined
    //  ...
    //  import type { LIDO_CONTRACT_NAMES } from '@lidofinance/lido-ethereum-sdk/common';
    //  OK: LIDO_CONTRACT_NAMES is Type
  } = useContractAddress('stakingRouter' as LIDO_CONTRACT_NAMES);

  const queryResult = useLidoQuery({
    queryKey: [
      'staking-fee-aggregate-distribution',
      core.chainId,
      stakingRouterAddress,
    ],
    strategy: {
      ...STRATEGY_CONSTANT,
      refetchInterval: 60000, // 1 minute
    },
    enabled:
      !!core &&
      !!core.chainId &&
      !!stakingRouterAddress &&
      !isAddressLoading &&
      !addressError,
    queryFn: async () => {
      if (!stakingRouterAddress) return;

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
