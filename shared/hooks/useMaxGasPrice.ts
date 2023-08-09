import { getStaticRpcBatchProvider } from '@lido-sdk/providers';
import { useLidoSWR, useSDK } from '@lido-sdk/react';
import { getBackendRPCPath, ONE_GWEI } from 'config';

import { BigNumber } from 'ethers';

// TODO: rewrite to use our own getFeeData
// provider.getFeeData() has very cranky placeholder implementation in ethers.js
// that has bad defaults and overprices txs
// source:
// https://github.com/ethers-io/ethers.js/blob/9373864742c179ba69c08c4f0c0661fdf78f8f63/src.ts/providers/abstract-provider.ts#L704
//
export const useMaxGasPrice = (): BigNumber | undefined => {
  const { chainId } = useSDK();
  const { data: maxGasPrice } = useLidoSWR(
    ['swr:max-gas-price', chainId],
    async () => {
      try {
        const provider = getStaticRpcBatchProvider(
          chainId,
          getBackendRPCPath(chainId),
        );
        const feeData = await provider.getFeeData();
        const maxGasPrice = feeData.maxFeePerGas;
        if (maxGasPrice) return maxGasPrice;
        return await provider.getGasPrice();
      } catch (e) {
        console.error(e);
      }
      return ONE_GWEI;
    },
    { isPaused: () => !chainId },
  );

  return maxGasPrice;
};
