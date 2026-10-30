import { overrideWithQAMockString, overrideWithQAMockNumber } from 'utils/qa';

import { DEFAULT_THRESHOLDS, type Thresholds, LEVEL_ORDER } from '../consts';
import type { TradeGuardLevel } from '../types';

const QA_KEY_LEVEL = 'mock-qa-helpers-trade-guard-level';

// ---------------------------------------------------------------------------
// QA override keys (only active when ENABLE_QA_HELPERS=true)
//
// NOTE: All QA overrides are clamped so they can only tighten protection,
// never relax it.
// ---------------------------------------------------------------------------

const QA_THRESHOLD_KEYS: Record<keyof Thresholds, string> = {
  oracleDeviationBlock: 'mock-qa-helpers-trade-guard-oracle-block',
  maxSellUsd: 'mock-qa-helpers-trade-guard-max-sell',
  minSellUsdToTriggerOracle: 'mock-qa-helpers-trade-guard-min-sell',
};

export const applyQALevelOverride = (
  level: TradeGuardLevel,
): TradeGuardLevel => {
  const v = overrideWithQAMockString(level, QA_KEY_LEVEL);
  const qaIdx = (LEVEL_ORDER as readonly string[]).indexOf(v);
  if (qaIdx === -1) return level;
  // QA can only escalate severity, never downgrade (e.g. safe→blocked OK, blocked→safe NO)
  const curIdx = LEVEL_ORDER.indexOf(level);
  return qaIdx >= curIdx ? LEVEL_ORDER[qaIdx] : level;
};

export const readThresholds = (): Thresholds => {
  const t = { ...DEFAULT_THRESHOLDS };
  for (const key of Object.keys(QA_THRESHOLD_KEYS) as (keyof Thresholds)[]) {
    const qa = overrideWithQAMockNumber(t[key], QA_THRESHOLD_KEYS[key]);
    const dflt = DEFAULT_THRESHOLDS[key];
    // QA overrides can only tighten thresholds, never relax them.
    // For all thresholds, lower = stricter.
    t[key] = Math.min(qa, dflt);
  }
  return t;
};
