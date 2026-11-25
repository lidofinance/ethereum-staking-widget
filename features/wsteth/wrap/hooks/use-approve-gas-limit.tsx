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
  type FeeEstimateTx,
} from 'modules/web3';

type ApproveGasLimitQueryResult = {
  gasLimit: bigint;
  tx?: FeeEstimateTx;
};

export const useApproveGasLimit = () => {
  const { chainId, isDappActiveOnL2 } = useDappStatus();
  const { wstETH } = useLidoSDK();
  const { l2, isL2Wrap } = useLidoSDKL2();

  const fallback = isDappActiveOnL2
    ? STETH_L2_APPROVE_GAS_LIMIT
    : WSTETH_APPROVE_GAS_LIMIT;

  const { data } = useQuery<ApproveGasLimitQueryResult>({
    queryKey: ['approve-wrap-gas-limit', isDappActiveOnL2, chainId],
    ...STRATEGY_LAZY,
    // served while the estimate loads; a failed estimate fails the query so
    // it is retried instead of the fallback being cached as an estimate
    placeholderData: { gasLimit: fallback },
    queryFn: async () => {
      try {
        if (isL2Wrap) {
          const props = {
            value: ESTIMATE_AMOUNT,
            account: config.ESTIMATE_ACCOUNT,
          };
          const [gasLimit, { to, data }] = await Promise.all([
            l2.approveWstethForWrapEstimateGas(props),
            l2.approveWstethForWrapPopulateTx(props),
          ]);
          // representative tx for chain-specific fee quotes (L1 data fee)
          return {
            gasLimit,
            tx: data
              ? { account: config.ESTIMATE_ACCOUNT, to, data }
              : undefined,
          };
        } else {
          const spender = await wstETH.contractAddress();

          const gasLimit = await wstETH.estimateApprove({
            amount: ESTIMATE_AMOUNT,
            to: spender,
            account: config.ESTIMATE_ACCOUNT,
          });
          return { gasLimit };
        }
      } catch (error) {
        console.warn('[approve-wrap-gas-limit]', error);
        throw error;
      }
    },
  });

  // the fallback also stands in after a failed estimate
  return { gasLimit: data?.gasLimit ?? fallback, tx: data?.tx };
};
