import { useCallback, useEffect, useState } from 'react';
import { useWSTETHContractRPC } from '@lido-sdk/react';
import { BigNumber } from 'ethers';

export const useWstethBySteth = (
  steth: BigNumber | undefined,
): BigNumber | undefined => {
  const [wstethBalance, setWstethBalance] = useState<BigNumber>();

  const wstethContractRPC = useWSTETHContractRPC();

  const getWstethBalance = useCallback(async () => {
    if (!steth) {
      return;
    }

    const wsteth = await wstethContractRPC.getWstETHByStETH(steth);
    setWstethBalance(wsteth);
  }, [wstethContractRPC, steth]);

  useEffect(() => {
    getWstethBalance();
  }, [getWstethBalance]);

  return wstethBalance;
};
