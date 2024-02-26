import { BigNumber } from 'ethers';
import { parseEther } from '@ethersproject/units';

export const PRECISION = 10 ** 6;

// how much to leave out on user balance when max is pressed
export const BALANCE_PADDING = parseEther('0.01');

export const SUBMIT_EXTRA_GAS_TRANSACTION_RATIO = 1.05;

export const STETH_SUBMIT_GAS_LIMIT_DEFAULT = 90000;

export const STAKE_GASLIMIT_FALLBACK = BigNumber.from(
  Math.floor(
    STETH_SUBMIT_GAS_LIMIT_DEFAULT * SUBMIT_EXTRA_GAS_TRANSACTION_RATIO,
  ),
);
