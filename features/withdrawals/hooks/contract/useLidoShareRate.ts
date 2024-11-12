import { useLidoSWR, SWRResponse, useSTETHContractRPC } from '@lido-sdk/react';

import { STRATEGY_CONSTANT } from 'consts/swr-strategies';
import { calcShareRate } from 'features/withdrawals/utils/calc-share-rate';
import { useDappStatus } from 'modules/web3';

// TODO: NEW SDK (REMOVE)
// DEPRECATED
export const useLidoShareRate = (): SWRResponse<bigint> => {
  const { chainId } = useDappStatus();
  const steth = useSTETHContractRPC();
  return useLidoSWR(
    ['swr:currentShareRate', steth.address, chainId],
    async () => {
      const [totalPooledEther, totalShares] = await Promise.all([
        steth.getTotalPooledEther(),
        steth.getTotalShares(),
      ]);
      return calcShareRate(totalPooledEther.toBigInt(), totalShares.toBigInt());
    },
    STRATEGY_CONSTANT,
  );
};
