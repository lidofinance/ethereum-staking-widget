// Can't use this code in config:
// the problem is caused by incompatibility between viem (ESM only) and Next.js 12 (next.config.mjs)

import { parseEther } from 'viem';

// how much to leave out on user balance when max is pressed
export const ESTIMATE_AMOUNT = parseEther('0.001');

export const BALANCE_PADDING = parseEther('0.01');
