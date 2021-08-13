import { AddressZero } from '@ethersproject/constants';
import { useSTETHContractWeb3 } from '@lido-sdk/react';
import { STETH_SUBMIT_GAS_LIMIT_DEFAULT } from 'config';
import { PayableOverrides } from 'ethers';
import { useCallback, useEffect, useState } from 'react';

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

  const steth = useSTETHContractWeb3();

  const estimateGas = useCallback(async () => {
    if (steth) {
      try {
        const gl = await steth.estimateGas.submit(_referral, overrides);
        setGasLimit(+gl);
      } catch (e) {
        setGasLimit(STETH_SUBMIT_GAS_LIMIT_DEFAULT);
        console.error(e);
      }
    }
  }, [_referral, overrides, steth]);

  useEffect(() => {
    estimateGas();
  }, [estimateGas]);

  return gasLimit;
};
