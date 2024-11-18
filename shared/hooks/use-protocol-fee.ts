import { formatEther } from 'viem';
import { STRATEGY_CONSTANT } from 'consts/react-query-strategies';
import { useLidoQuery } from 'shared/hooks/use-lido-query';
import { useLidoSDK } from 'modules/web3';
import { useStakingRouterAddress } from './use-stakign-router-contract-address';

export const useProtocolFee = () => {
  const { core } = useLidoSDK();
  const {
    data: address,
    isLoading: isAddressLoading,
    error: addressError,
  } = useStakingRouterAddress();

  const queryResult = useLidoQuery({
    queryKey: ['staking-fee-aggregate-distribution', core.chainId, address],
    strategy: {
      ...STRATEGY_CONSTANT,
      refetchInterval: 60000, // 1 minute
    },
    enabled:
      !!core &&
      !!core.chainId &&
      !!address &&
      !isAddressLoading &&
      !addressError,
    queryFn: async () => {
      if (!address) return;

      return await core.rpcProvider.readContract({
        address,
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
