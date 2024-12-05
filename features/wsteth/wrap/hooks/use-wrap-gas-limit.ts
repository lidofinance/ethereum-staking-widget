import { useQuery } from '@tanstack/react-query';
import type { LidoSDKWrap } from '@lidofinance/lido-ethereum-sdk/wrap';

import { config } from 'config';
import { STRATEGY_EAGER } from 'consts/react-query-strategies';
import {
  WRAP_FROM_ETH_GAS_LIMIT,
  WRAP_GAS_LIMIT,
  WRAP_L2_GAS_LIMIT,
} from 'consts/tx';
import { applyGasLimitRatio } from 'utils/apply-gas-limit-ratio';
import {
  useDappStatus,
  useLidoSDK,
  useLidoSDKL2,
  ESTIMATE_AMOUNT,
} from 'modules/web3';

const fetchGasLimitETH = async (wrap: LidoSDKWrap) => {
  try {
    return await wrap.wrapEthEstimateGas({
      value: ESTIMATE_AMOUNT,
      account: config.ESTIMATE_ACCOUNT,
    });
  } catch (error) {
    console.warn(`[wrap-gas-limit::eth]`, error);
    return applyGasLimitRatio(WRAP_FROM_ETH_GAS_LIMIT);
  }
};

const fetchGasLimitStETH = async (
  isL2: boolean,
  l2: any,
  wrap: any,
  wrapFallback: bigint,
) => {
  try {
    if (isL2) {
      // L2 unwrap steth to wsteth
      return await l2.unwrapStethEstimateGas({
        value: ESTIMATE_AMOUNT,
        account: config.ESTIMATE_ACCOUNT,
      });
    } else {
      // L1 wrap steth to wsteth
      return await wrap.wrapStethEstimateGas({
        value: ESTIMATE_AMOUNT,
        account: config.ESTIMATE_ACCOUNT,
      });
    }
  } catch (error) {
    console.warn(`[wrap-gas-limit::steth]`, error);
    return wrapFallback;
  }
};

export const useWrapGasLimit = () => {
  const { chainId, isDappActiveOnL2 } = useDappStatus();
  const { wrap } = useLidoSDK();
  const { l2, isL2 } = useLidoSDKL2();

  const wrapFallback = isDappActiveOnL2 ? WRAP_L2_GAS_LIMIT : WRAP_GAS_LIMIT;

  const { data } = useQuery<{
    gasLimitETH: bigint | null;
    gasLimitStETH: bigint;
  }>({
    queryKey: ['wrap-gas-limit', chainId, isL2],
    ...STRATEGY_EAGER,
    queryFn: async () =>
      Promise.all([
        !isL2 ? fetchGasLimitETH(wrap) : Promise.resolve(null),
        fetchGasLimitStETH(isL2, l2, wrap, wrapFallback),
      ]).then(([gasLimitETH, gasLimitStETH]) => ({
        gasLimitETH,
        gasLimitStETH,
      })),
  });

  return {
    gasLimitETH: data?.gasLimitETH || WRAP_FROM_ETH_GAS_LIMIT,
    gasLimitStETH: data?.gasLimitStETH || wrapFallback,
  };
};
