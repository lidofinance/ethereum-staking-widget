import { useCallback, useEffect, useState } from 'react';
import { useWSTETHContractRPC } from '@lido-sdk/react';
import { BigNumber } from 'ethers';

export const useStethByWsteth = (
  wsteth: BigNumber | undefined,
): BigNumber | undefined => {
  const [stethBalance, setStethBalance] = useState<BigNumber>();

  const wstethContractRPC = useWSTETHContractRPC();

  const getStethBalance = useCallback(async () => {
    if (!wsteth) {
      return;
    }

    const steth = await wstethContractRPC.getStETHByWstETH(wsteth);
    setStethBalance(steth);
  }, [wstethContractRPC, wsteth]);

  useEffect(() => {
    getStethBalance();
  }, [getStethBalance]);

  return stethBalance;
};
