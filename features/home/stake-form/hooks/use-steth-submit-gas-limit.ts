import { useCallback, useEffect, useState } from 'react';
import { PayableOverrides } from 'ethers';
import { AddressZero } from '@ethersproject/constants';
import { useSTETHContractRPC } from '@lido-sdk/react';
import { STETH_SUBMIT_GAS_LIMIT_DEFAULT } from 'config';

type UseStethSubmitGasLimit = (
  _referral?: string,
  overrides?:
    | (PayableOverrides & {
        from?: string | Promise<string> | undefined;
      })
    | undefined,
) => number | undefined;

// TODO: when returning BigNumber causes infinite loop
export const useStethSubmitGasLimit: UseStethSubmitGasLimit = (
  _referral = AddressZero,
  overrides,
) => {
  const [gasLimit, setGasLimit] = useState<number>();

  const stethContractRPC = useSTETHContractRPC();

  const estimateGas = useCallback(async () => {
    if (stethContractRPC) {
      try {
        const gl = await stethContractRPC.estimateGas.submit(
          _referral,
          overrides,
        );
        setGasLimit(+gl);
      } catch (e) {
        setGasLimit(STETH_SUBMIT_GAS_LIMIT_DEFAULT);
        console.warn('Failed to estimate gas limit');
      }
    }
  }, [_referral, overrides, stethContractRPC]);

  useEffect(() => {
    estimateGas();
  }, [estimateGas]);

  return gasLimit;
};
