import { useCallback, useEffect, useState } from 'react';
import { AddressZero } from '@ethersproject/constants';
import { useSTETHContractRPC } from '@lido-sdk/react';
import { STETH_SUBMIT_GAS_LIMIT_DEFAULT } from 'config';
import { parseEther } from '@ethersproject/units';

type UseStethSubmitGasLimit = () => number | undefined;

// TODO: when returning BigNumber causes infinite loop
export const useStethSubmitGasLimit: UseStethSubmitGasLimit = () => {
  const [gasLimit, setGasLimit] = useState<number>();

  const stethContractRPC = useSTETHContractRPC();
  const VITALIK = '0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B';

  const estimateGas = useCallback(async () => {
    if (stethContractRPC) {
      try {
        const gl = await stethContractRPC.estimateGas.submit(AddressZero, {
          from: VITALIK,
          value: parseEther('0.1'),
        });
        setGasLimit(+gl);
      } catch (e) {
        setGasLimit(STETH_SUBMIT_GAS_LIMIT_DEFAULT);
        console.warn('Failed to estimate gas limit');
      }
    }
  }, [stethContractRPC]);

  useEffect(() => {
    estimateGas();
  }, [estimateGas]);

  return gasLimit;
};
