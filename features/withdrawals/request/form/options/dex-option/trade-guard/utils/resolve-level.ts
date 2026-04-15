import { DEFAULT_THRESHOLDS, type Thresholds } from '../consts';
import type { TradeGuardLevel } from '../types';

export const LEVEL_ORDER: TradeGuardLevel[] = ['safe', 'limit', 'blocked'];

export const resolveLevel = (
  oracleDev: number | null,
  t: Thresholds = DEFAULT_THRESHOLDS,
): TradeGuardLevel => {
  if (oracleDev !== null && oracleDev >= t.oracleDeviationBlock) {
    return 'blocked';
  }
  return 'safe';
};
