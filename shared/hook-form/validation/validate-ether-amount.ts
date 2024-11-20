import { MAX_UINT_256, ZERO } from 'modules/web3';
import { getTokenDisplayName } from 'utils/getTokenDisplayName';
import { ValidationError } from './validation-error';
import { TOKENS_WRAPPABLE } from '../../../features/wsteth/shared/types';

// asserts only work with function declaration
// eslint-disable-next-line func-style
export function validateEtherAmount(
  field: string,
  amount: bigint | undefined | null,
  token: TOKENS_WRAPPABLE,
): asserts amount is bigint {
  // also checks undefined
  if (amount == null) throw new ValidationError(field, '');

  if (amount <= ZERO)
    throw new ValidationError(
      field,
      `Enter ${getTokenDisplayName(token)} ${field} greater than 0`,
    );

  if (amount > MAX_UINT_256)
    throw new ValidationError(
      field,
      `${getTokenDisplayName(token)} ${field} is not valid`,
    );
}
