import { parseEther } from 'viem';
import { MaxUint256 } from '@ethersproject/constants';

export const ONE_wstETH = parseEther('1');

export const ONE_stETH = parseEther('1');

export const ZERO = parseEther('0');

// TODO: NEW SDK (Type error: Exponentiation cannot be performed on 'bigint' values unless the 'target' option is set to 'es2016' or later.)
// export const MAX_UINT_256 = BigInt(2) ** BigInt(256) - BigInt(1);
export const MAX_UINT_256 = MaxUint256.toBigInt();
