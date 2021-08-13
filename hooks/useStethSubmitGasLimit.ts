/* eslint-disable @typescript-eslint/no-unused-vars */
import { AddressZero, Zero } from '@ethersproject/constants';
import { parseEther } from '@ethersproject/units';
import { useSTETHContractWeb3, useWSTETHContractWeb3 } from '@lido-sdk/react';
import { useWeb3 } from '@lido-sdk/web3-react';
import { getStethAddress, STANDARD_GAS_LIMIT } from 'config';
import { PayableOverrides } from 'ethers';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { usePrevious } from './usePrevious';

type UseStethSubmitGasLimit = (
  _referral?: string,
  overrides?:
    | (PayableOverrides & {
        from?: string | Promise<string> | undefined;
      })
    | undefined,
) => { simulating: boolean; gasLimit: number };

export const useStethSubmitGasLimit: UseStethSubmitGasLimit = (
  _referral = AddressZero,
  overrides,
) => {
  const [gasLimit, setGasLimit] = useState<number>(21000);
  const [simulating, setSimulating] = useState(false);

  const steth = useSTETHContractWeb3();

  const simulate = useCallback(async () => {
    // setSimulating(true);

    if (steth) {
      const newGasLimit = await steth?.estimateGas.submit(
        // test args
        '0xe8B2097674daF8fC3DcCDDf05a2cBeF8253A4bAB',
        {
          value: parseEther('1'),
        },
      );
      setGasLimit(Number(newGasLimit));
    }

    // setSimulating(false);
  }, [steth]);

  useEffect(() => {
    simulate();
  }, [simulate]);

  return {
    simulating,
    gasLimit,
  };
};
