import { DEFAULT_THRESHOLDS, type Thresholds } from '../consts';
import type { TradeGuardLevel } from '../types';

export const LEVEL_ORDER: TradeGuardLevel[] = ['safe', 'blocked'];

export const resolveLevel = (
  fiatDev: number | null,
  oracleDev: number | null,
  t: Thresholds = DEFAULT_THRESHOLDS,
): TradeGuardLevel => {
  if (oracleDev !== null && oracleDev >= t.oracleDeviationBlock) {
    return 'blocked';
  }
  if (fiatDev !== null && fiatDev >= t.fiatDeviationBlock) {
    return 'blocked';
  }
  return 'safe';
};
