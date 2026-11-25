import { GAS_FEE_MODEL } from '../model';
import type { FeeModelDefinition } from '../types';
import { getFeeHistoryMaxFee } from './fee-history';

// EIP-1559 fee market where eth_estimateGas already folds the L1 data cost
// into the gas units, so the chain-wide price is the whole cost
export const arbitrumFeeModel: FeeModelDefinition = {
  model: GAS_FEE_MODEL.Arbitrum,
  getMaxFee: getFeeHistoryMaxFee,
};
