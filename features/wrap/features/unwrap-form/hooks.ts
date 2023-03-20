import { parseEther } from '@ethersproject/units';
import { getStaticRpcBatchProvider } from 'utils/rpcProviders';
import { useLidoSWR, useWSTETHContractRPC } from '@lido-sdk/react';
import { useWeb3 } from 'reef-knot/web3-react';
import { ESTIMATE_ACCOUNT, getBackendRPCPath, UNWRAP_GAS_LIMIT } from 'config';
import { BigNumber } from 'ethers';

export const useUnwrapGasLimit = () => {
  const wsteth = useWSTETHContractRPC();
  const { chainId } = useWeb3();

  const { data } = useLidoSWR(
    ['swr:unwrap-gas-limit', chainId],
    async (_key, chainId) => {
      if (!chainId) {
        return;
      }

      const provider = getStaticRpcBatchProvider(
        // TODO: add a way to type useWeb3 hook
        chainId as number,
        getBackendRPCPath(chainId as number),
      );

      const feeData = await provider.getFeeData();
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
