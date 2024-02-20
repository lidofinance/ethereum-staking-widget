import { useLidoSWR, useWSTETHContractRPC } from '@lido-sdk/react';
import { ESTIMATE_ACCOUNT, ESTIMATE_AMOUNT } from 'config/estimate';
import { UNWRAP_GAS_LIMIT } from 'consts/tx';

import { useCurrentStaticRpcProvider } from 'shared/hooks/use-current-static-rpc-provider';
import { STRATEGY_LAZY } from 'utils/swrStrategies';

export const useUnwrapGasLimit = () => {
  const wsteth = useWSTETHContractRPC();
  const { chainId } = useCurrentStaticRpcProvider();

  const { data } = useLidoSWR(
    ['swr:unwrap-gas-limit', chainId],
    async (_key, chainId) => {
      if (!chainId) return;
      try {
        const gasLimit = await wsteth.estimateGas.unwrap(ESTIMATE_AMOUNT, {
          from: ESTIMATE_ACCOUNT,
        });
        return gasLimit;
      } catch (error) {
        console.warn(error);
        return UNWRAP_GAS_LIMIT;
      }
    },
    STRATEGY_LAZY,
  );

  return data ?? UNWRAP_GAS_LIMIT;
};
