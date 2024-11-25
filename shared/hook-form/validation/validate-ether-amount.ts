import { maxUint256 } from 'viem';
// Tests failed if import import { ZERO } from 'modules/web3';
import { ZERO } from 'modules/web3/consts/units';
import { getTokenDisplayName } from 'utils/getTokenDisplayName';
import { ValidationError } from './validation-error';
import { TOKENS_TO_WRAP } from 'features/wsteth/shared/types';

// asserts only work with function declaration
// eslint-disable-next-line func-style
export function validateEtherAmount(
  field: string,
  amount: bigint | undefined | null,
  token: TOKENS_TO_WRAP,
): asserts amount is bigint {
  // also checks undefined
  if (amount == null) throw new ValidationError(field, '');

  if (amount <= ZERO)
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
