import { AddressZero } from '@ethersproject/constants';
import { useLidoSWR, useSTETHContractRPC } from '@lido-sdk/react';
import { ESTIMATE_ACCOUNT, STETH_SUBMIT_GAS_LIMIT_DEFAULT } from 'config';
import { parseEther } from '@ethersproject/units';
import { BigNumber } from 'ethers';
import { getFeeData } from 'utils/getFeeData';
import { useCurrentProvider } from 'shared/hooks/use-current-provider';

type UseStethSubmitGasLimit = () => number | undefined;

export const useStethSubmitGasLimit: UseStethSubmitGasLimit = () => {
  const stethContractRPC = useSTETHContractRPC();

  const { chainId, provider } = useCurrentProvider();

  const { data } = useLidoSWR(
    ['swr:submit-gas-limit', chainId],
    async (_key, chainId) => {
      if (!chainId) {
        return;
      }

      const feeData = await getFeeData(provider);
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
