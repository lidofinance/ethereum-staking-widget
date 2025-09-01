import invariant from 'tiny-invariant';
import { useQuery } from '@tanstack/react-query';
import { CHAINS } from '@lidofinance/lido-ethereum-sdk/common';

import { PartialCurveAbi } from 'abi/partial-curve-abi';
import { WEI_PER_ETHER } from 'consts/tx';
import { useMainnetOnlyWagmi } from 'modules/web3';
import { getContractAddress } from 'config/networks/contract-address';

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

      const address = getContractAddress(CHAINS.Mainnet, 'stethCurve');
      invariant(
        address,
        `[useStethEthRate] The "stethCurve" contract address must be defined`,
      );

      return publicClientMainnet.readContract({
        address,
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
