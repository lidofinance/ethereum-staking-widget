export type { FeeEstimateTx } from './types';
export { useMaxGasPrice } from './hooks/use-max-gas-price';
export { useMaxTxCost } from './hooks/use-max-tx-cost';
export { estimateSendFees } from './estimate';
// chain-explicit cost quotes, for flows that price a tx outside the dapp chain
export {
  composeMaxTxCost,
  estimateMaxFee,
  estimateTxFees,
  hasTxSpecificFees,
} from './estimate';
