import { AddressZero } from '@ethersproject/constants';
import { useLidoSWR, useSTETHContractRPC } from '@lido-sdk/react';
import { ESTIMATE_ACCOUNT, STETH_SUBMIT_GAS_LIMIT_DEFAULT } from 'config';
import { parseEther } from '@ethersproject/units';
import { useWeb3 } from 'reef-knot/web3-react';
import { BigNumber } from 'ethers';
import { getFeeData } from 'utils/getFeeData';
import { CHAINS } from '@lido-sdk/constants';

type UseStethSubmitGasLimit = () => number | undefined;

export const useStethSubmitGasLimit: UseStethSubmitGasLimit = () => {
  const stethContractRPC = useSTETHContractRPC();

  const { chainId } = useWeb3();
  const { data } = useLidoSWR(
    ['swr:submit-gas-limit', chainId],
    async (_key, chainId) => {
      if (!chainId) {
        return;
      }

      const feeData = await getFeeData(chainId as CHAINS);
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
