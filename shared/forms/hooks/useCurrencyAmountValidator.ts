import { useCallback } from 'react';

import { Zero } from '@ethersproject/constants';
import { formatEther, parseEther } from '@ethersproject/units';
import type { BigNumber } from 'ethers';

import { isValidEtherValue } from 'utils';
import type { ValidationFn } from 'shared/forms/types/validation-fn';

export type UseCurrencyAmountValidatorArgs = {
  inputName: string;
  limit?: BigNumber;
};

export const useCurrencyAmountValidator = ({
  inputName,
  limit,
}: UseCurrencyAmountValidatorArgs) => {
  return useCallback<ValidationFn>(
    (value) => {
      if (!value) return `${inputName} is required`;

      if (!isValidEtherValue(value))
        return `${inputName} must be a valid number with up to 18 decimal places`;

      const amount = Number(value);
      const amountBigNumber = parseEther(value);

      if (
        Number.isNaN(amount) || // no NaN
        !Number.isFinite(amount) || // no infinity or -infinity
        value.includes('e') // no numbers in scientific notation
      )
        return `${inputName} must be a number`;

      if (amountBigNumber.lt(Zero))
        return `${inputName} must not be a negative number`;

      if (amountBigNumber.eq(Zero))
        return `${inputName} must be greater than 0`;

      if (limit && amountBigNumber.gt(limit))
        return `${inputName} must not be greater than ${formatEther(limit)}`;

      return '';
    },
    [inputName, limit],
  );
};
