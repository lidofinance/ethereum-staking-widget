import { useCallback } from 'react';
import invariant from 'tiny-invariant';

import { useSDK, useWSTETHContractWeb3 } from '@lido-sdk/react';

import { useCurrentStaticRpcProvider } from 'shared/hooks/use-current-static-rpc-provider';
import { getFeeData } from 'utils/getFeeData';

import type { UnwrapFormInputType } from '../unwrap-form-context';

type UnwrapTxProcessorArgs = UnwrapFormInputType & {
  isMultisig: boolean;
};

export const useUnwrapTxProcessing = () => {
  const { chainId, providerWeb3 } = useSDK();
  const { staticRpcProvider } = useCurrentStaticRpcProvider();
  const wstethContractWeb3 = useWSTETHContractWeb3();

  return useCallback(
    async ({ isMultisig, amount }: UnwrapTxProcessorArgs) => {
      invariant(amount, 'amount id must be presented');
      invariant(chainId, 'chain id must be presented');
      invariant(providerWeb3, 'providerWeb3 must be presented');
      invariant(wstethContractWeb3, 'must have wstethContractWeb3');

      if (isMultisig) {
        const tx = await wstethContractWeb3.populateTransaction.unwrap(amount);
        return providerWeb3.getSigner().sendUncheckedTransaction(tx);
      } else {
        const { maxFeePerGas, maxPriorityFeePerGas } = await getFeeData(
          staticRpcProvider,
        );
        return wstethContractWeb3.unwrap(amount, {
          maxPriorityFeePerGas: maxPriorityFeePerGas ?? undefined,
          maxFeePerGas: maxFeePerGas ?? undefined,
        });
      }
    },
    [chainId, providerWeb3, staticRpcProvider, wstethContractWeb3],
  );
};
