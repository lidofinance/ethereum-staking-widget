import { ValidationError } from './validation-error';
import type { BigNumber } from 'ethers';

export const validateBignumberMin = (
  field: string,
  value: BigNumber,
  min: BigNumber,
  message: string,
) => {
  if (value.lt(min)) throw new ValidationError(field, message);
};
