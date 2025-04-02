import invariant from 'tiny-invariant';
import { useQuery } from '@tanstack/react-query';
import { CHAINS } from '@lidofinance/lido-ethereum-sdk';

import { PartialCurveAbi } from 'abi/partial-curve-abi';
import { NETWORKS_MAP } from 'config/networks/networks-map';
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
        address:
          NETWORKS_MAP[CHAINS.Mainnet].contracts
            .LIDO_CURVE_LIQUIDITY_FARMING_POOL,
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
