import { maxUint112, maxUint24 } from 'viem';
import { GGV_DEPOSIT_TOKENS } from './deposit/form-context/types';

export const GGV_TOKEN_SYMBOL = 'gg';

export const GGV_DEPOSABLE_TOKENS: GGV_DEPOSIT_TOKENS[] = [
  'ETH',
  'wETH',
  'stETH',
  'wstETH',
];

export const INFINITE_DEPOSIT_CAP = maxUint112;
export const MAX_REQUEST_DEADLINE = Number(maxUint24);
