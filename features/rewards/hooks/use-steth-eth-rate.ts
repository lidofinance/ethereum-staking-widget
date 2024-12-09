import invariant from 'tiny-invariant';
import { useQuery } from '@tanstack/react-query';

import { PartialCurveAbi } from 'abi/partial-curve-abi';
import { WEI_PER_ETHER } from 'consts/tx';
import { useMainnetOnlyWagmi } from 'modules/web3';

export const MAINNET_CURVE = '0xDC24316b9AE028F1497c275EB9192a3Ea0f67022';

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
        address: MAINNET_CURVE,
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
