import { BigNumber } from 'ethers';
import { parseEther } from '@ethersproject/units';
import { useLidoSWR, useWSTETHContractRPC } from '@lido-sdk/react';

import { ESTIMATE_ACCOUNT, UNWRAP_GAS_LIMIT } from 'config';
import { getFeeData } from 'utils/getFeeData';
import { useCurrentProvider } from 'shared/hooks/use-current-provider';

export const useUnwrapGasLimit = () => {
  const wsteth = useWSTETHContractRPC();
  const { chainId, provider } = useCurrentProvider();

  const { data } = useLidoSWR(
    ['swr:unwrap-gas-limit', chainId],
    async (_key, chainId) => {
      if (!chainId) return;
      try {
        const feeData = await getFeeData(provider);
        const maxPriorityFeePerGas = feeData.maxPriorityFeePerGas ?? undefined;
        const maxFeePerGas = feeData.maxFeePerGas ?? undefined;

        const gasLimit = await wsteth.estimateGas.unwrap(parseEther('0.0001'), {
          from: ESTIMATE_ACCOUNT,
          maxPriorityFeePerGas,
          maxFeePerGas,
        });
        return gasLimit;
      } catch (error) {
        console.warn(error);
        return BigNumber.from(UNWRAP_GAS_LIMIT);
      }
    },
  );

  return data ?? UNWRAP_GAS_LIMIT;
};
