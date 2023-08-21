import { ValidationError } from './validation-error';
import type { BigNumber } from 'ethers';

export const validateBignumberMax = (
  field: string,
  value: BigNumber,
  max: BigNumber,
  message: string,
) => {
  if (value.gt(max)) throw new ValidationError(field, message);
};
