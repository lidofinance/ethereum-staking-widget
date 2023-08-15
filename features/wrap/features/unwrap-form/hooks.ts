import { parseEther } from '@ethersproject/units';
import { useLidoSWR, useWSTETHContractRPC } from '@lido-sdk/react';
import { useWeb3 } from 'reef-knot/web3-react';
import { ESTIMATE_ACCOUNT, UNWRAP_GAS_LIMIT } from 'config';
import { BigNumber } from 'ethers';
import { getFeeData } from 'utils/getFeeData';
import { CHAINS } from '@lido-sdk/constants';

export const useUnwrapGasLimit = () => {
  const wsteth = useWSTETHContractRPC();
  const { chainId } = useWeb3();

  const { data } = useLidoSWR(
    ['swr:unwrap-gas-limit', chainId],
    async (_key, chainId) => {
      if (!chainId) {
        return;
      }

      const feeData = await getFeeData(chainId as CHAINS);
      const maxPriorityFeePerGas = feeData.maxPriorityFeePerGas ?? undefined;
      const maxFeePerGas = feeData.maxFeePerGas ?? undefined;

      const gasLimit = await wsteth.estimateGas
        .unwrap(parseEther('0.0001'), {
          from: ESTIMATE_ACCOUNT,
          maxPriorityFeePerGas,
          maxFeePerGas,
        })
        .catch((error) => {
          console.warn(error);
          return BigNumber.from(UNWRAP_GAS_LIMIT);
        });

      return +gasLimit;
    },
  );

  return data ?? UNWRAP_GAS_LIMIT;
};
