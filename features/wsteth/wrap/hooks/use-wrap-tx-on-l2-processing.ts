import { useCallback } from 'react';
import invariant from 'tiny-invariant';

import { useLidoSDK } from 'providers/lido-sdk';
import type { WrapFormInputType } from '../wrap-form-context';

type WrapTxProcessorArgs = Omit<WrapFormInputType, 'token'>;

export const useWrapTxOnL2Processing = () => {
  const { sdk } = useLidoSDK();

  return useCallback(
    async ({ amount }: WrapTxProcessorArgs) => {
      invariant(amount, 'amount id must be presented');

      // The operation 'stETH to wstETH' on L2 is 'unwrap'
      return await sdk.l2.unwrap({
        // value: amount.toString(), <- Not working
        value: amount.toBigInt(),
      });
    },
    [sdk.l2],
  );
};
