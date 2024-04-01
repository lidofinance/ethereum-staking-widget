import { overrideWithQAMockArray } from 'utils/qa';
import type { DexWithdrawalApi } from '../request/withdrawal-rates';

// max requests count for one tx
export const MAX_REQUESTS_COUNT = 256;
export const MAX_REQUESTS_COUNT_LEDGER_LIMIT = 2;

export const DEFAULT_CLAIM_REQUEST_SELECTED = 80;
export const MAX_SHOWN_REQUEST_PER_TYPE = 1024;

// time that validation function waits for context data to resolve
// should be enough to load token balances/tvl/max&min amounts and other contract data
export const VALIDATION_CONTEXT_TIMEOUT = 4000;

export const ENABLED_WITHDRAWAL_DEXES: DexWithdrawalApi[] =
  overrideWithQAMockArray(
    ['one-inch', 'bebop'],
    'mock-qa-helpers-enabled-withdrawal-dexes',
  );
