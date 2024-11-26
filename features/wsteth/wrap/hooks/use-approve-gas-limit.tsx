import { useQuery } from '@tanstack/react-query';
import { config } from 'config';
import {
  STETH_L2_APPROVE_GAS_LIMIT,
  WSTETH_APPROVE_GAS_LIMIT,
} from 'consts/tx';
import { STRATEGY_LAZY } from 'consts/react-query-strategies';

import {
  useLidoSDK,
  useLidoSDKL2,
  useDappStatus,
  ESTIMATE_AMOUNT,
} from 'modules/web3';

export const useApproveGasLimit = () => {
  const { chainId, isDappActiveOnL2 } = useDappStatus();
  const { stETH, wstETH } = useLidoSDK();
  const { l2, isL2 } = useLidoSDKL2();

  const fallback = isDappActiveOnL2
    ? STETH_L2_APPROVE_GAS_LIMIT
    : WSTETH_APPROVE_GAS_LIMIT;

  const { data } = useQuery<bigint | undefined>({
    queryKey: ['approve-wrap-gas-limit', isDappActiveOnL2, chainId],
    ...STRATEGY_LAZY,
    queryFn: async () => {
      try {
        const spender = await (isL2
          ? l2.contractAddress()
          : wstETH.contractAddress());

        // TODO
        // l1: wrap.approveStethForWrapEstimateGas
        // l2: l2.approveWstethForWrapEstimateGas
        const contract = await (isL2 ? l2.getContract() : stETH.getContract());

        return await contract.estimateGas.approve([spender, ESTIMATE_AMOUNT], {
          account: config.ESTIMATE_ACCOUNT,
        });
      } catch (error) {
        console.warn(error);
        return fallback;
      }
    },
  });

  return data ?? fallback;
};
