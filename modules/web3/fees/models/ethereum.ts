import { GAS_FEE_MODEL } from '../model';
import type { FeeModelDefinition } from '../types';
import { getFeeHistoryMaxFee } from './fee-history';

// Plain EIP-1559 fee market: the chain-wide price is the whole cost
export const ethereumFeeModel: FeeModelDefinition = {
  model: GAS_FEE_MODEL.Ethereum,
  getMaxFee: getFeeHistoryMaxFee,
};
