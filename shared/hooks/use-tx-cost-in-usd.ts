import { useMaxTxCost, type FeeEstimateTx } from 'modules/web3';
import { useEthUsd } from './use-eth-usd';

// `tx` is the representative transaction; on chains that price txs
// individually (OP-stack L1 data fee, Linea) the cost is understated without it
export const useTxCostInUsd = (
  gasLimit?: bigint,
  chainId?: number,
  tx?: FeeEstimateTx,
) => {
  const { maxGasPrice, maxTxCost, ...maxTxCostState } = useMaxTxCost({
    chainId,
    gasLimit,
    tx,
  });

  const { usdAmount, ...ethUsdState } = useEthUsd(maxTxCost);

  return {
    maxGasPrice,
    txCostUsd: usdAmount,

    get isLoading() {
      return maxTxCostState.isLoading || ethUsdState.isLoading;
    },
    get error() {
      return maxTxCostState.error || ethUsdState.error;
    },
    get isFetching() {
      return maxTxCostState.isFetching || ethUsdState.isFetching;
    },
    update() {
      return Promise.all([maxTxCostState.update(), ethUsdState.update()]);
    },
  };
};
