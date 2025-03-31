import invariant from 'tiny-invariant';
import { useQuery } from '@tanstack/react-query';

import { PartialCurveAbi } from 'abi/partial-curve-abi';
import { CONTRACTS_MAP } from 'config';
import { WEI_PER_ETHER } from 'consts/tx';
import { useMainnetOnlyWagmi } from 'modules/web3';

export const useStethEthRate = ({ enabled = true }) => {
  const { publicClientMainnet } = useMainnetOnlyWagmi();

  const { data, error, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['get_dy', publicClientMainnet],
    enabled: enabled && !!publicClientMainnet,
    queryFn: () => {
      invariant(
        publicClientMainnet,
        '[useStethEthRate] The "publicClientMainnet" must be define',
      );

      return publicClientMainnet.readContract({
        address: CONTRACTS_MAP.mainnet.LIDO_CURVE_LIQUIDITY_FARMING_POOL,
        abi: PartialCurveAbi,
        functionName: 'get_dy',
        args: [0n, 1n, WEI_PER_ETHER],
      });
    },
  });

  return {
    data: data || WEI_PER_ETHER,
    isLoading,
    error,
    isFetching,
    update: refetch,
  };
};
