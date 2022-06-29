import { AddressZero } from '@ethersproject/constants';
import { useLidoSWR, useSTETHContractRPC } from '@lido-sdk/react';
import {
  ESTIMATE_ACCOUNT,
  getBackendRPCPath,
  STETH_SUBMIT_GAS_LIMIT_DEFAULT,
} from 'config';
import { parseEther } from '@ethersproject/units';
import { useWeb3 } from '@lido-sdk/web3-react';
import { getStaticRpcBatchProvider } from '@lido-sdk/providers';
import { BigNumber } from 'ethers';
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

      const provider = getStaticRpcBatchProvider(
        chainId as CHAINS,
        getBackendRPCPath(chainId as CHAINS),
      );

      const feeData = await provider.getFeeData();
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
