import { useCallback } from 'react';
import invariant from 'tiny-invariant';

import { useLidoSDK } from 'providers/lido-sdk';

import type { WrapFormInputType } from '../wrap-form-context';

type WrapTxProcessorArgs = Omit<WrapFormInputType, 'token'>;

export const useWrapTxOnL2Processing = () => {
  const { lidoSDKL2 } = useLidoSDK();

  return useCallback(
    async ({ amount }: WrapTxProcessorArgs) => {
      invariant(amount, 'amount id must be presented');

      // The operation 'stETH to wstETH' on L2 is 'unwrap'
      return await lidoSDKL2.unwrap({
        value: amount.toBigInt(),
      });
    },
    [lidoSDKL2],
  );
};
