import { useLidoSWR } from '@lido-sdk/react';

import { config } from 'config';
import { UNWRAP_GAS_LIMIT, UNWRAP_L2_GAS_LIMIT } from 'consts/tx';
import { STRATEGY_LAZY } from 'consts/swr-strategies';
import { useLidoSDK } from 'providers/lido-sdk';
import { useDappStatus } from 'shared/hooks/use-dapp-status';
import { BigNumber } from 'ethers';

export const useUnwrapGasLimit = () => {
  const { isDappActiveOnL2 } = useDappStatus();
  const { l2, isL2, wrap, core } = useLidoSDK();

  const fallback = isDappActiveOnL2 ? UNWRAP_L2_GAS_LIMIT : UNWRAP_GAS_LIMIT;

  const { data } = useLidoSWR(
    ['swr:unwrap-gas-limit', isDappActiveOnL2, core.chainId],
    async () => {
      try {
        const contract = await (isL2
          ? l2.getContract()
          : wrap.getContractWstETH());

        const gas = await contract.estimateGas.unwrap(
          [config.ESTIMATE_AMOUNT.toBigInt()],
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
