import { parseEther } from '@ethersproject/units';
import { getStaticRpcBatchProvider } from '@lido-sdk/providers';
import {
  useLidoSWR,
  useSTETHContractRPC,
  useWSTETHContractRPC,
} from '@lido-sdk/react';
import { useWeb3 } from '@lido-sdk/web3-react';
import {
  ESTIMATE_ACCOUNT,
  getBackendRPCPath,
  WSTETH_APPROVE_GAS_LIMIT,
} from 'config';

export const useApproveGasLimit = () => {
  const steth = useSTETHContractRPC();
  const wsteth = useWSTETHContractRPC();
  const { chainId } = useWeb3();

  const { data } = useLidoSWR(
    `swr:approve-wrap-gas-limit:${chainId}`,
    async () => {
      if (!chainId) {
        return;
      }

      const provider = getStaticRpcBatchProvider(
        chainId,
        getBackendRPCPath(chainId),
      );

      const feeData = await provider.getFeeData();
      const maxPriorityFeePerGas = feeData.maxPriorityFeePerGas ?? undefined;
      const maxFeePerGas = feeData.maxFeePerGas ?? undefined;

      const gasLimit = await steth.estimateGas.approve(
        wsteth.address,
        parseEther('0.001'),
        {
          from: ESTIMATE_ACCOUNT,
          maxPriorityFeePerGas,
          maxFeePerGas,
        },
      );

      return +gasLimit;
    },
  );

  return data ?? WSTETH_APPROVE_GAS_LIMIT;
};
