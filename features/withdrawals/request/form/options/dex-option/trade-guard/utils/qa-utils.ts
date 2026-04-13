import { overrideWithQAMockString, overrideWithQAMockNumber } from 'utils/qa';

import { DEFAULT_THRESHOLDS, type Thresholds } from '../consts';
import { TradeGuardLevel } from '../types';

import { LEVEL_ORDER } from './resolve-level';

const QA_KEY_LEVEL = 'mock-qa-helpers-trade-guard-level';

// ---------------------------------------------------------------------------
// QA override keys (only active when ENABLE_QA_HELPERS=true)
//
// NOTE: All QA overrides are clamped so they can only tighten protection,
// never relax it.
// ---------------------------------------------------------------------------

export const QA_THRESHOLD_KEYS: Record<keyof Thresholds, string> = {
  fiatDeviationWarning: 'mock-qa-helpers-trade-guard-fiat-warning',
  fiatDeviationDanger: 'mock-qa-helpers-trade-guard-fiat-danger',
  fiatDeviationBlock: 'mock-qa-helpers-trade-guard-fiat-block',
  oracleDeviationDanger: 'mock-qa-helpers-trade-guard-oracle-danger',
  oracleDeviationBlock: 'mock-qa-helpers-trade-guard-oracle-block',
  minReceiveRatioThreshold: 'mock-qa-helpers-trade-guard-min-ratio',
  slippageCheckMinFiat: 'mock-qa-helpers-trade-guard-slippage-min-fiat',
  maxAllowedSellAmount: 'mock-qa-helpers-trade-guard-max-sell',
  minSellUnitsToTriggerOracle: 'mock-qa-helpers-trade-guard-min-sell',
};

export const applyQALevelOverride = (
  level: TradeGuardLevel,
): TradeGuardLevel => {
  const v = overrideWithQAMockString(level, QA_KEY_LEVEL);
  if (!LEVEL_ORDER.includes(v as TradeGuardLevel)) return level;
  // QA can only escalate severity, never downgrade (e.g. warning→danger OK, danger→safe NO)
  const qaIdx = LEVEL_ORDER.indexOf(v as TradeGuardLevel);
  const curIdx = LEVEL_ORDER.indexOf(level);
  return qaIdx >= curIdx ? (v as TradeGuardLevel) : level;
};

export const readThresholds = (): Thresholds => {
  const t = { ...DEFAULT_THRESHOLDS };
  for (const key of Object.keys(QA_THRESHOLD_KEYS) as (keyof Thresholds)[]) {
    const qa = overrideWithQAMockNumber(t[key], QA_THRESHOLD_KEYS[key]);
    const dflt = DEFAULT_THRESHOLDS[key];
    // QA overrides can only tighten thresholds, never relax them.
    // For ratio thresholds, higher = stricter; for all others, lower = stricter.
    t[key] =
      key === 'minReceiveRatioThreshold'
        ? Math.max(qa, dflt)
        : Math.min(qa, dflt);
  }
  return t;
};
