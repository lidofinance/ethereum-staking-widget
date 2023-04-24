import { useCallback } from 'react';

import { BigNumber } from 'ethers';
import { formatEther, parseEther } from '@ethersproject/units';
import type { ValidationFn } from 'shared/forms/types/validation-fn';

type UseValidateUnstakeValueArgs = {
  minAmount?: BigNumber;
};

export const useValidateUnstakeValue = ({
  minAmount,
}: UseValidateUnstakeValueArgs) => {
  return useCallback<ValidationFn>(
    (value: string) => {
      const amountBigNumber = parseEther(value);

      if (minAmount && amountBigNumber.lt(minAmount))
        return `Minimum unstake amount is ${formatEther(minAmount)} stETH`;

      return '';
    },
    [minAmount],
  );
};
