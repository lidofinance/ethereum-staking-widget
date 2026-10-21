import invariant from 'tiny-invariant';

import type { OracleResult } from '../../oracles/types';

import {
  TRADE_BUILD_ERROR,
  TRADE_ORACLE_DEVIATION_ERROR,
  type Thresholds,
} from '../consts';
import type { OracleOutcome } from '../types';

import { resolveLevel } from './resolve-level';

export const applyOracleResult = (
  result: OracleResult,
  t: Thresholds,
): OracleOutcome => {
  if (result.ok) {
    const level = resolveLevel(result.deviation, t);
    const messages =
      result.deviation >= t.oracleDeviationBlock
        ? [
            TRADE_ORACLE_DEVIATION_ERROR(
              result.deviation,
              t.oracleDeviationBlock,
            ),
          ]
        : [];

    return { level, messages, verified: true };
  }

  switch (result.reason) {
    case 'unavailable':
      return {
        level: 'blocked',
        messages: [TRADE_BUILD_ERROR(1004)],
        verified: false,
      };
    case 'unsupported':
      return {
        level: 'blocked',
        messages: [TRADE_BUILD_ERROR(1005)],
        verified: false,
      };
    default:
      invariant(false, `Unknown oracle result reason: ${result.reason}`);
  }
};
