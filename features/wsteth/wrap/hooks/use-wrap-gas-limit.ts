import { useQuery } from '@tanstack/react-query';
import type { Address, Hex } from 'viem';
import type { LidoSDKWrap } from '@lidofinance/lido-ethereum-sdk/wrap';

import { config } from 'config';
import { STRATEGY_CONSTANT } from 'consts/react-query-strategies';
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
  type FeeEstimateTx,
} from 'modules/web3';

// Logs which call failed and lets the failure reach the query, so the query
// fails and is retried instead of caching a fallback as an estimate
const warnOnFailure = async <T>(
  label: string,
  run: () => Promise<T>,
): Promise<T> => {
  try {
    return await run();
  } catch (error) {
    console.warn(`[wrap-gas-limit::${label}]`, error);
    throw error;
  }
};

const estimateProps = {
  value: ESTIMATE_AMOUNT,
  account: config.ESTIMATE_ACCOUNT,
};

const fetchGasLimitETH = (wrap: LidoSDKWrap) =>
  warnOnFailure('eth', () => wrap.wrapEthEstimateGas(estimateProps));

const fetchGasLimitStETH = (isL2: boolean, l2: any, wrap: any) =>
  warnOnFailure<bigint>('steth', () =>
    isL2
      ? // L2 unwrap steth to wsteth
        l2.unwrapStethEstimateGas(estimateProps)
      : // L1 wrap steth to wsteth
        wrap.wrapStethEstimateGas(estimateProps),
  );

// representative L2 wrap tx (stETH -> wstETH) for chain-specific fee quotes
const populateTxStETH = async (
  isL2: boolean,
  l2: any,
): Promise<FeeEstimateTx | undefined> => {
  if (!isL2) return undefined;
  const { to, data } = await warnOnFailure<{ to: Address; data?: Hex }>(
    'steth-tx',
    () => l2.unwrapStethPopulateTx(estimateProps),
  );
  if (!data) return undefined;
  return { account: config.ESTIMATE_ACCOUNT, to, data };
};

type WrapGasLimitQueryResult = {
  gasLimitETH: bigint | null;
  gasLimitStETH: bigint;
  txStETH?: FeeEstimateTx;
};

export const useWrapGasLimit = () => {
  const { chainId } = useDappStatus();
  const { wrap } = useLidoSDK();
  const { l2, isL2Wrap } = useLidoSDKL2();

  // Served while the estimates load and after they failed; a failed estimate
  // fails the query so it is retried instead of the fallback being cached
  const fallback: WrapGasLimitQueryResult = {
    gasLimitETH: isL2Wrap ? null : applyGasLimitRatio(WRAP_FROM_ETH_GAS_LIMIT),
    gasLimitStETH: isL2Wrap ? WRAP_L2_GAS_LIMIT : WRAP_GAS_LIMIT,
    txStETH: undefined,
  };

  const { data } = useQuery<WrapGasLimitQueryResult>({
    queryKey: ['wrap-gas-limit', chainId, isL2Wrap],
    ...STRATEGY_CONSTANT,
    placeholderData: fallback,
    queryFn: async () =>
      Promise.all([
        !isL2Wrap ? fetchGasLimitETH(wrap) : Promise.resolve(null),
        fetchGasLimitStETH(isL2Wrap, l2, wrap),
        populateTxStETH(isL2Wrap, l2),
      ]).then(([gasLimitETH, gasLimitStETH, txStETH]) => ({
        gasLimitETH,
        gasLimitStETH,
        txStETH,
      })),
  });

  const { gasLimitETH, gasLimitStETH, txStETH } = data ?? fallback;
  return {
    // null on L2, where ETH is not wrapped
    gasLimitETH: gasLimitETH ?? WRAP_FROM_ETH_GAS_LIMIT,
    gasLimitStETH,
    txStETH,
  };
};
