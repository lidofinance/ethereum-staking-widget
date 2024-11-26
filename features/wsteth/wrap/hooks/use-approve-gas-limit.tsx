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
  const { wstETH } = useLidoSDK();
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

        if (isL2) {
          return await l2.approveWstethForWrapEstimateGas({
            value: ESTIMATE_AMOUNT,
            // to: spender,
            account: config.ESTIMATE_ACCOUNT,
          });
        } else {
          return await wstETH.estimateApprove({
            amount: ESTIMATE_AMOUNT,
            to: spender,
            account: config.ESTIMATE_ACCOUNT,
          });
        }
      } catch (error) {
        console.warn(error);
        return fallback;
      }
    },
  });

  return data ?? fallback;
};
