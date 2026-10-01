// Can't use this code in config:
// the problem is caused by incompatibility between viem (ESM only) and Next.js 12 (next.config.mjs)

import { parseEther } from 'viem';

//
export const ESTIMATE_AMOUNT_L2 = parseEther('0.0001');

export const ESTIMATE_AMOUNT = parseEther('0.001');

// this is the padding to leave on user balance for safety during eth value transactions
export const BALANCE_PADDING = parseEther('0.01');

// same value above but adjusted for L2 transactions
export const BALANCE_PADDING_L2 = parseEther('0.001');
