import { BigNumber } from 'ethers';
import { useLidoSWR } from '@lido-sdk/react';

import { config } from 'config';
import {
  STETH_L2_APPROVE_GAS_LIMIT,
  WSTETH_APPROVE_GAS_LIMIT,
} from 'consts/tx';
import { isSDKSupportedL2Chain } from 'consts/chains';
import { STRATEGY_LAZY } from 'consts/swr-strategies';
import { useLidoSDK } from 'providers/lido-sdk';
import { useDappStatus } from 'shared/hooks/use-dapp-status';

export const useApproveGasLimit = () => {
  const { isDappActiveOnL2 } = useDappStatus();
  const { l2, stETH, wstETH, core } = useLidoSDK();

  const fallback = isDappActiveOnL2
    ? STETH_L2_APPROVE_GAS_LIMIT
    : WSTETH_APPROVE_GAS_LIMIT;

  const { data } = useLidoSWR(
    ['swr:approve-wrap-gas-limit', isDappActiveOnL2, core.chainId],
    async () => {
      try {
        // wsteth on l1, steth on l2
        const spender = await (isSDKSupportedL2Chain(core.chainId as any)
          ? l2.contractAddress()
          : wstETH.contractAddress());

        // steth on l1, wsteth on l2
        const contract = await (isSDKSupportedL2Chain(core.chainId as any)
          ? l2.getContract()
          : stETH.getContract());

        const gas = contract.estimateGas.approve(
          [spender, config.ESTIMATE_AMOUNT.toBigInt()],
          {
            account: config.ESTIMATE_ACCOUNT,
          },
        );
        return BigNumber.from(gas);
      } catch (error) {
        console.warn(error);
        return fallback;
      }
    },
    STRATEGY_LAZY,
  );

  return data ?? fallback;
};
