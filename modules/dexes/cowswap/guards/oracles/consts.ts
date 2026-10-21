import { PARTNER_FEE_BPS } from '../../consts';

import { OracleResult } from './types';

// Partner fee as a percentage (0.3%) — subtracted from deviation calculations
// because it's a known fixed cost the user has agreed to, not an unexpected loss
export const PARTNER_FEE_PCT = PARTNER_FEE_BPS / 100;

// Oracle failure results
export const FAIL_UNSUPPORTED: OracleResult = {
  ok: false,
  reason: 'unsupported',
};
export const FAIL_UNAVAILABLE: OracleResult = {
  ok: false,
  reason: 'unavailable',
};
