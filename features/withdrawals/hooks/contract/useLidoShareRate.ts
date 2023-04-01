import { useSDK, useLidoSWR, SWRResponse } from '@lido-sdk/react';
import { useSTETHContractRPC } from 'customSdk/contracts';
import { BigNumber } from 'ethers';
import { calcShareRate } from 'features/withdrawals/utils/calc-share-rate';

export const useLidoShareRate = (): SWRResponse<BigNumber> => {
  const { chainId } = useSDK();
  const steth = useSTETHContractRPC();
  return useLidoSWR(
    ['swr:currentShareRate', steth.address, chainId],
    async () => {
      const [totalPooledEther, totalShares] = await Promise.all([
        steth.getTotalPooledEther(),
        steth.getTotalShares(),
      ]);
      return calcShareRate(totalPooledEther, totalShares);
    },
  );
};
