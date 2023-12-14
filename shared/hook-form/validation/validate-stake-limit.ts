import { LIMIT_LEVEL } from 'types';
import { ValidationError } from './validation-error';

export const validateStakeLimit = (
  field: string,
  stakeLimitLevel: LIMIT_LEVEL,
) => {
  if (stakeLimitLevel === LIMIT_LEVEL.REACHED)
    throw new ValidationError(
      field,
      'Stake limit is exhausted. Please wait until the limit is restored.',
    );
};
