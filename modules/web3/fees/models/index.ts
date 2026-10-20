import { GAS_FEE_MODEL } from '../model';
import type { FeeModelDefinition } from '../types';
import { ethereumFeeModel } from './ethereum';
import { arbitrumFeeModel } from './arbitrum';
import { opStackFeeModel } from './op-stack';
import { lineaFeeModel } from './linea';

export const FEE_MODELS: Record<GAS_FEE_MODEL, FeeModelDefinition> = {
  [GAS_FEE_MODEL.Ethereum]: ethereumFeeModel,
  [GAS_FEE_MODEL.Arbitrum]: arbitrumFeeModel,
  [GAS_FEE_MODEL.OpStack]: opStackFeeModel,
  [GAS_FEE_MODEL.Linea]: lineaFeeModel,
};
