import type { BigNumber } from 'ethers';
import { MaxUint256, Zero } from '@ethersproject/constants';
import {
  getTokenDisplayName,
  TOKEN_DISPLAY_NAMES,
} from 'utils/getTokenDisplayName';
import { ValidationError } from './validation-error';

// asserts only work with function declaration
// eslint-disable-next-line func-style
export function validateEtherAmount(
  field: string,
  amount: BigNumber | null,
  token: keyof typeof TOKEN_DISPLAY_NAMES,
): asserts amount is BigNumber {
  if (!amount) throw new ValidationError(field, '');

  if (amount.lte(Zero))
    throw new ValidationError(
      field,
      `Enter ${getTokenDisplayName(token)} ${field} greater than 0`,
    );

  if (amount.gt(MaxUint256))
    throw new ValidationError(
      field,
      `${getTokenDisplayName(token)} ${field} is not valid`,
    );
}
