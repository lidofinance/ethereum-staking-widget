import { useLidoSWR, useWSTETHContractRPC } from '@lido-sdk/react';

import { config } from 'config';
import { UNWRAP_GAS_LIMIT } from 'consts/tx';
import { STRATEGY_LAZY } from 'consts/swr-strategies';
import { useCurrentStaticRpcProvider } from 'shared/hooks/use-current-static-rpc-provider';

export const useUnwrapGasLimit = () => {
  const wsteth = useWSTETHContractRPC();
  const { chainId } = useCurrentStaticRpcProvider();

  const { data } = useLidoSWR(
    ['swr:unwrap-gas-limit', chainId],
    async (_key, chainId) => {
      if (!chainId) return;
      try {
        const gasLimit = await wsteth.estimateGas.unwrap(
          config.ESTIMATE_AMOUNT,
          {
            from: config.ESTIMATE_ACCOUNT,
          },
        );
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
