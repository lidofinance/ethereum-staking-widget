import { DEFAULT_THRESHOLDS, type Thresholds } from '../consts';
import type { TradeGuardLevel } from '../types';

export const LEVEL_ORDER: TradeGuardLevel[] = [
  'safe',
  'warning',
  'danger',
  'blocked',
];

const higher = (a: TradeGuardLevel, b: TradeGuardLevel): TradeGuardLevel =>
  LEVEL_ORDER.indexOf(a) >= LEVEL_ORDER.indexOf(b) ? a : b;

export const resolveLevel = (
  fiatDev: number | null,
  oracleDev: number | null,
  t: Thresholds = DEFAULT_THRESHOLDS,
): TradeGuardLevel => {
  let level: TradeGuardLevel = 'safe';

  if (oracleDev !== null) {
    if (oracleDev >= t.oracleDeviationBlock) level = 'blocked';
    else if (oracleDev >= t.oracleDeviationDanger) level = 'danger';
  }

  if (fiatDev !== null) {
    let fiatLevel: TradeGuardLevel = 'safe';

    if (fiatDev >= t.fiatDeviationBlock) fiatLevel = 'blocked';
    else if (fiatDev >= t.fiatDeviationDanger) fiatLevel = 'danger';
    else if (fiatDev >= t.fiatDeviationWarning) fiatLevel = 'warning';

    level = higher(level, fiatLevel);
  }

  return level;
};
