import { useCallback } from 'react';
import invariant from 'tiny-invariant';

import { useLidoSDK } from 'providers/lido-sdk';

import type { WrapFormInputType } from '../wrap-form-context';

type WrapTxProcessorArgs = Omit<WrapFormInputType, 'token'>;

export const useWrapTxOnL2Processing = () => {
  const { l2 } = useLidoSDK();

  return useCallback(
    async ({ amount }: WrapTxProcessorArgs) => {
      invariant(amount, 'amount id must be presented');

      // The operation 'stETH to wstETH' on L2 is 'unwrap'
      return await l2.unwrapStethToWsteth({
        value: amount.toBigInt(),
      });
    },
    [l2],
  );
};
