import invariant from 'tiny-invariant';

import type { OracleResult } from '../../oracles';

import {
  TRADE_BUILD_ERROR,
  TRADE_ORACLE_DEVIATION_ERROR,
  type Thresholds,
} from '../consts';
import type { OracleOutcome } from '../types';

import { resolveLevel } from './resolve-level';

const ORACLE_FAILURE_CODES: Record<
  Extract<OracleResult, { ok: false }>['reason'],
  number
> = {
  unavailable: 1004,
  unsupported: 1005,
};

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

  const code = ORACLE_FAILURE_CODES[result.reason];
  invariant(
    typeof code === 'number',
    `Unknown oracle result reason: ${result.reason}`,
  );

  return {
    level: 'blocked',
    messages: [TRADE_BUILD_ERROR(code)],
    verified: false,
  };
};
