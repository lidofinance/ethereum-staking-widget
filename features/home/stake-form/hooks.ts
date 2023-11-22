import { BigNumber } from 'ethers';

import { AddressZero } from '@ethersproject/constants';
import { parseEther } from '@ethersproject/units';
import { useLidoSWR, useSTETHContractRPC } from '@lido-sdk/react';

import { ESTIMATE_ACCOUNT, STETH_SUBMIT_GAS_LIMIT_DEFAULT } from 'config';
import { getFeeData } from 'utils/getFeeData';
import { useCurrentStaticRpcProvider } from 'shared/hooks/use-current-static-rpc-provider';

type UseStethSubmitGasLimit = () => number | undefined;

export const useStethSubmitGasLimit: UseStethSubmitGasLimit = () => {
  const stethContractRPC = useSTETHContractRPC();

  const { chainId, staticRpcProvider } = useCurrentStaticRpcProvider();

  const { data } = useLidoSWR(
    ['swr:submit-gas-limit', chainId],
    async (_key, chainId) => {
      if (!chainId) {
        return;
      }

      const feeData = await getFeeData(staticRpcProvider);
      const maxPriorityFeePerGas = feeData.maxPriorityFeePerGas ?? undefined;
      const maxFeePerGas = feeData.maxFeePerGas ?? undefined;

      const gasLimit = await stethContractRPC.estimateGas
        .submit(AddressZero, {
          from: ESTIMATE_ACCOUNT,
          value: parseEther('0.001'),
          maxPriorityFeePerGas,
          maxFeePerGas,
        })
        .catch((error) => {
          console.warn(error);
          return BigNumber.from(STETH_SUBMIT_GAS_LIMIT_DEFAULT);
        });

      return +gasLimit;
    },
  );

  return data ?? STETH_SUBMIT_GAS_LIMIT_DEFAULT;
};
