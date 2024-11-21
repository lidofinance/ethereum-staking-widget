import { useQuery } from '@tanstack/react-query';
import { config } from 'config';
import {
  STETH_L2_APPROVE_GAS_LIMIT,
  WSTETH_APPROVE_GAS_LIMIT,
} from 'consts/tx';
import { STRATEGY_LAZY } from 'consts/react-query-strategies';

import { useLidoSDK, useDappStatus } from 'modules/web3';

export const useApproveGasLimit = () => {
  const { isDappActiveOnL2 } = useDappStatus();
  const { l2, stETH, isL2, wstETH, core } = useLidoSDK();

  const fallback = isDappActiveOnL2
    ? STETH_L2_APPROVE_GAS_LIMIT
    : WSTETH_APPROVE_GAS_LIMIT;

  const { data } = useQuery<bigint | undefined>({
    queryKey: ['approve-wrap-gas-limit', isDappActiveOnL2, core.chainId],
    ...STRATEGY_LAZY,
    queryFn: async () => {
      try {
        const spender = await (isL2
          ? l2.contractAddress()
          : wstETH.contractAddress());

        const contract = await (isL2 ? l2.getContract() : stETH.getContract());

        return await contract.estimateGas.approve(
          [spender, config.ESTIMATE_AMOUNT],
          {
            account: config.ESTIMATE_ACCOUNT,
          },
        );
      } catch (error) {
        console.warn(error);
        return fallback;
      }
    },
  });

  return data ?? fallback;
};
