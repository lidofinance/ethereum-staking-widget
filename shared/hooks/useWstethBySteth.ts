import { useEffect, useMemo, useState } from 'react';
import { useWSTETHContractRPC } from '@lido-sdk/react';
import { BigNumber } from 'ethers';
import debounce from 'lodash/debounce';

export const useWstethBySteth = (
  steth: BigNumber | undefined,
): BigNumber | undefined => {
  const [wstethBalance, setWstethBalance] = useState<BigNumber>();

  const wstethContractRPC = useWSTETHContractRPC();

  const getWstethBalance = useMemo(
    () =>
      debounce(async (steth: BigNumber | undefined) => {
        if (!steth) {
          return;
        }

        const wsteth = await wstethContractRPC.getWstETHByStETH(steth);
        setWstethBalance(wsteth);
      }, 500),
    [wstethContractRPC],
  );

  useEffect(() => {
    getWstethBalance(steth);
  }, [getWstethBalance, steth]);

  return wstethBalance;
};
