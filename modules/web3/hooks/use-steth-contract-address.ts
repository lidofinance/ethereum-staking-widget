import { useQuery } from '@tanstack/react-query';
import { useLidoSDK, useLidoSDKL2 } from 'modules/web3';

export const useStETHContractAddress = () => {
  const { stETH } = useLidoSDK();
  const { l2, isL2 } = useLidoSDKL2();

  return useQuery({
    queryKey: ['use-steth-contract-address', isL2, l2.steth, stETH],
    enabled: !!(isL2 ? l2.steth : stETH),
    staleTime: Infinity,
    queryFn: () =>
      isL2 ? l2.steth.contractAddress() : stETH.contractAddress(),
  });
};
