import { useLidoQuery } from 'shared/hooks/use-lido-query';

import { config } from 'config';
import { STRATEGY_EAGER } from 'consts/react-query-strategies';
import {
  WRAP_FROM_ETH_GAS_LIMIT,
  WRAP_GAS_LIMIT,
  WRAP_L2_GAS_LIMIT,
} from 'consts/tx';
import { applyGasLimitRatioBigInt } from 'utils/apply-gas-limit-ratio';
import { useDappStatus, useLidoSDK, ZERO } from 'modules/web3';

const fetchGasLimitETH = async (isL2: boolean, wrap: any) => {
  if (isL2) return ZERO;
  try {
    return applyGasLimitRatioBigInt(
      await wrap.wrapEthEstimateGas({
        value: config.ESTIMATE_AMOUNT_BIGINT,
        account: config.ESTIMATE_ACCOUNT,
      }),
    );
  } catch (error) {
    console.warn(`[wrap-gas-limit::eth]`, error);
    return applyGasLimitRatioBigInt(WRAP_FROM_ETH_GAS_LIMIT);
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
      const contract = await l2.getContract();
      return await contract.estimateGas.unwrap(
        [config.ESTIMATE_AMOUNT_BIGINT],
        {
          account: config.ESTIMATE_ACCOUNT,
        },
      );
    } else {
      // L1 wrap steth to wsteth
      const contract = await wrap.getContractWstETH();
      return await contract.estimateGas.wrap([config.ESTIMATE_AMOUNT_BIGINT], {
        account: config.ESTIMATE_ACCOUNT,
      });
    }
  } catch (error) {
    console.warn(`[wrap-gas-limit::steth]`, error);
    return wrapFallback;
  }
};

export const useWrapGasLimit = () => {
  const { isDappActiveOnL2 } = useDappStatus();
  const { l2, isL2, wrap, core } = useLidoSDK();

  const wrapFallback = isDappActiveOnL2 ? WRAP_L2_GAS_LIMIT : WRAP_GAS_LIMIT;

  const { data } = useLidoQuery<{
    gasLimitETH: bigint;
    gasLimitStETH: bigint;
  }>({
    queryKey: ['wrap-gas-limit', core.chainId, isL2],
    strategy: STRATEGY_EAGER,
    queryFn: async () => {
      const [gasLimitETH, gasLimitStETH] = await Promise.all([
        fetchGasLimitETH(isL2, wrap),
        fetchGasLimitStETH(isL2, l2, wrap, wrapFallback),
      ]);

      return {
        gasLimitETH,
        gasLimitStETH,
      };
    },
  });

  return {
    gasLimitETH: data?.gasLimitETH || WRAP_FROM_ETH_GAS_LIMIT,
    gasLimitStETH: data?.gasLimitStETH || wrapFallback,
  };
};
