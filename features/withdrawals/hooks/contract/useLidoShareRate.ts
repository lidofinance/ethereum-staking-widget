import {
  useSDK,
  useLidoSWR,
  SWRResponse,
  useSTETHContractRPC,
} from '@lido-sdk/react';
import { BigNumber } from 'ethers';
import { calcShareRate } from 'features/withdrawals/utils/calc-share-rate';
import { STRATEGY_CONSTANT } from 'utils/swrStrategies';

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
    STRATEGY_CONSTANT,
  );
};
