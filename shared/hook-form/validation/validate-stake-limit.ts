import { LIMIT_LEVEL } from 'types';
import { ValidationError } from './validation-error';

export const validateStakeLimit = (
  field: string,
  stakeLimitLevel: LIMIT_LEVEL,
) => {
  if (stakeLimitLevel === LIMIT_LEVEL.REACHED)
    throw new ValidationError(
      field,
      "Staking limit reached. Please wait until it's restored",
    );
};
