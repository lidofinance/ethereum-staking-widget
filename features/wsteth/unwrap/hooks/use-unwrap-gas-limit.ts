import { useQuery } from '@tanstack/react-query';
import { config } from 'config';
import { UNWRAP_GAS_LIMIT, UNWRAP_L2_GAS_LIMIT } from 'consts/tx';
import { STRATEGY_LAZY } from 'consts/react-query-strategies';
import {
  useLidoSDK,
  useDappStatus,
  ESTIMATE_AMOUNT,
  useLidoSDKL2,
  type FeeEstimateTx,
} from 'modules/web3';

type UnwrapGasLimitQueryResult = {
  gasLimit: bigint;
  tx?: FeeEstimateTx;
};

export const useUnwrapGasLimit = () => {
  const { chainId, isDappActiveOnL2 } = useDappStatus();
  const { wrap } = useLidoSDK();
  const { l2, isL2Wrap } = useLidoSDKL2();

  const fallback = isDappActiveOnL2 ? UNWRAP_L2_GAS_LIMIT : UNWRAP_GAS_LIMIT;

  const { data } = useQuery<UnwrapGasLimitQueryResult>({
    queryKey: ['unwrap-gas-limit', isDappActiveOnL2, chainId],
    ...STRATEGY_LAZY,
    queryFn: async () => {
      try {
        if (isL2Wrap) {
          const props = {
            value: ESTIMATE_AMOUNT,
            account: config.ESTIMATE_ACCOUNT,
          };
          const [gasLimit, { to, data }] = await Promise.all([
            l2.wrapWstethToStethEstimateGas(props),
            l2.wrapWstethToStethPopulateTx(props),
          ]);
          // representative tx for chain-specific fee quotes (L1 data fee)
          return {
            gasLimit,
            tx: data
              ? { account: config.ESTIMATE_ACCOUNT, to, data }
              : undefined,
          };
        } else {
          const gasLimit = await wrap.unwrapEstimateGas({
            value: ESTIMATE_AMOUNT,
            account: config.ESTIMATE_ACCOUNT,
          });
          return { gasLimit };
        }
      } catch (error) {
        console.warn(error);
        return { gasLimit: fallback };
      }
    },
  });

  return { gasLimit: data?.gasLimit ?? fallback, tx: data?.tx };
};
