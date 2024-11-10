import { MAX_UINT_256, ZERO } from 'modules/web3';
import {
  getTokenDisplayName,
  TOKEN_DISPLAY_NAMES,
} from 'utils/getTokenDisplayName';
import { isNonNegativeBigInt } from 'utils/is-non-negative-bigint';
import { ValidationError } from './validation-error';

// asserts only work with function declaration
// eslint-disable-next-line func-style
export function validateEtherAmount(
  field: string,
  amount: bigint | undefined,
  token: keyof typeof TOKEN_DISPLAY_NAMES,
): asserts amount is bigint {
  if (!isNonNegativeBigInt(amount)) throw new ValidationError(field, '');

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  if (amount! <= ZERO)
    throw new ValidationError(
      field,
      `Enter ${getTokenDisplayName(token)} ${field} greater than 0`,
    );

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  if (amount! > MAX_UINT_256)
    throw new ValidationError(
      field,
      `${getTokenDisplayName(token)} ${field} is not valid`,
    );
}
