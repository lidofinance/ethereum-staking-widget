import { BigNumber } from 'ethers';
import {
  useSDK,
  useLidoSWR,
  SWRResponse,
  useSTETHContractRPC,
} from '@lido-sdk/react';

import { STRATEGY_CONSTANT } from 'consts/swr-strategies';
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
    STRATEGY_CONSTANT,
  );
};
