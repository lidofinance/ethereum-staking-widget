import { maxUint256 } from 'viem';
import type { TokenSymbol } from 'consts/tokens';
import { getTokenSymbol } from 'utils/get-token-symbol';
import { ValidationError } from './validation-error';

// asserts only work with function declaration
// eslint-disable-next-line func-style
export function validateEtherAmount(
  field: string,
  amount: bigint | undefined | null,
  token: TokenSymbol,
): asserts amount is bigint {
  // also checks undefined
  if (amount == null) throw new ValidationError(field, '');

  if (amount <= 0n)
    throw new ValidationError(
      field,
      `Enter ${getTokenSymbol(token)} ${field} greater than 0`,
    );

  if (amount > maxUint256)
    throw new ValidationError(
      field,
      `${getTokenSymbol(token)} ${field} is not valid`,
    );
}
