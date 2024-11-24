import { useQuery } from '@tanstack/react-query';
import { useLidoSDK } from 'modules/web3';

export const useWstETHContractAddress = () => {
  const { wstETH, l2, isL2 } = useLidoSDK();

  return useQuery({
    queryKey: ['use-wsteth-contract-address', isL2, l2.wsteth, wstETH],
    enabled: !!(isL2 ? l2.wsteth : wstETH),
    staleTime: Infinity,
    queryFn: () =>
      isL2 ? l2.wsteth.contractAddress() : wstETH.contractAddress(),
  });
};
