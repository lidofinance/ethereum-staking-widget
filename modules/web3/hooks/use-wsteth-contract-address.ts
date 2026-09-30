import { useQuery } from '@tanstack/react-query';
import { STRATEGY_IMMUTABLE } from 'consts/react-query-strategies';
import { useLidoSDK, useLidoSDKL2 } from 'modules/web3';

export const useWstETHContractAddress = () => {
  const { wstETH } = useLidoSDK();
  const { l2, isL2 } = useLidoSDKL2();

  return useQuery({
    queryKey: ['use-wsteth-contract-address', isL2, l2.wsteth, wstETH],
    enabled: !!(isL2 ? l2.wsteth : wstETH),
    ...STRATEGY_IMMUTABLE,
    queryFn: () =>
      isL2 ? l2.wsteth.contractAddress() : wstETH.contractAddress(),
  });
};
