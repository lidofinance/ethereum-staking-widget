import { useLidoSWR } from '@lido-sdk/react';

import { config } from 'config';
import {
  STETH_L2_APPROVE_GAS_LIMIT,
  WSTETH_APPROVE_GAS_LIMIT,
} from 'consts/tx';
import { STRATEGY_LAZY } from 'consts/swr-strategies';
import { useLidoSDK, useDappStatus } from 'modules/web3';

export const useApproveGasLimit = () => {
  const { isDappActiveOnL2 } = useDappStatus();
  const { l2, stETH, isL2, wstETH, core } = useLidoSDK();

  const fallback = isDappActiveOnL2
    ? STETH_L2_APPROVE_GAS_LIMIT
    : WSTETH_APPROVE_GAS_LIMIT;

  // TODO: NEW_SDK (useQuery)
  const { data } = useLidoSWR(
    ['swr:approve-wrap-gas-limit', isDappActiveOnL2, core.chainId],
    async () => {
      try {
        // wsteth on l1, steth on l2
        const spender = await (isL2
          ? l2.contractAddress()
          : wstETH.contractAddress());

        // steth on l1, wsteth on l2
        const contract = await (isL2 ? l2.getContract() : stETH.getContract());

        return await contract.estimateGas.approve(
          // TODO: NEW_SDK (ESTIMATE_AMOUNT will be bigint)
          [spender, config.ESTIMATE_AMOUNT.toBigInt()],
          {
            account: config.ESTIMATE_ACCOUNT,
          },
        );
      } catch (error) {
        console.warn(error);
        return fallback;
      }
    },
    STRATEGY_LAZY,
  );

  return data ?? fallback;
};
