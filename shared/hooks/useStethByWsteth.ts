import { useMemo, useEffect, useState } from 'react';
import { useWSTETHContractRPC } from '@lido-sdk/react';
import { BigNumber } from 'ethers';
import debounce from 'lodash/debounce';

export const useStethByWsteth = (
  wsteth: BigNumber | undefined,
): BigNumber | undefined => {
  const [stethBalance, setStethBalance] = useState<BigNumber>();

  const wstethContractRPC = useWSTETHContractRPC();

  const getStethBalance = useMemo(
    () =>
      debounce(async (wsteth: BigNumber | undefined) => {
        if (!wsteth) {
          return;
        }

        const steth = await wstethContractRPC.getStETHByWstETH(wsteth);
        setStethBalance(steth);
      }, 500),
    [wstethContractRPC],
  );

  useEffect(() => {
    getStethBalance(wsteth);
  }, [getStethBalance, wsteth]);

  return stethBalance;
};
