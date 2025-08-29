import { maxUint256 } from 'viem';
import {
  getTokenDisplayName,
  TOKEN_DISPLAY_NAMES,
} from 'utils/getTokenDisplayName';
import { ValidationError } from './validation-error';

// asserts only work with function declaration
// eslint-disable-next-line func-style
export function validateEtherAmount(
  field: string,
  amount: bigint | undefined | null,
  token: TOKEN_DISPLAY_NAMES,
): asserts amount is bigint {
  // also checks undefined
  if (amount == null) throw new ValidationError(field, '');

  if (amount <= 0n)
    throw new ValidationError(
      field,
      `Enter ${getTokenDisplayName(token)} ${field} greater than 0`,
    );

  if (amount > maxUint256)
    throw new ValidationError(
      field,
      `${getTokenDisplayName(token)} ${field} is not valid`,
    );
}
