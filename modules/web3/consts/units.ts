import { parseEther } from 'viem';

export const ONE_wstETH = parseEther('1');

export const ONE_stETH = parseEther('1');

// BigInt('0') or 0n is equivalent
export const ZERO = parseEther('0');

// TODO: Exponentiation cannot be performed on 'bigint' values unless the 'target' option is set to 'es2016' or later.)
//  export const MAX_UINT_256 = BigInt(2) ** BigInt(256) - BigInt(1);
//  or
//  export const MAX_UINT_256 = 2n ** 256n - 1n;
export const MAX_UINT_256 = BigInt(
  '115792089237316195423570985008687907853269984665640564039457584007913129639935',
);
