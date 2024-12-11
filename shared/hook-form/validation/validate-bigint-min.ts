import { ValidationError } from './validation-error';

export const validateBigintMin = (
  field: string,
  value: bigint,
  min: bigint,
  message: string,
) => {
  if (value < min) throw new ValidationError(field, message);
};
