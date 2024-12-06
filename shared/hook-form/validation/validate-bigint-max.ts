import { ValidationError } from './validation-error';

export const validateBigintMax = (
  field: string,
  value: bigint,
  max: bigint,
  message: string,
) => {
  if (value > max) throw new ValidationError(field, message);
};
