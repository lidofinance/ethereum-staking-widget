import { useCallback } from 'react';

import { formatEther, parseEther } from '@ethersproject/units';
import type { BigNumber } from 'ethers';

type UseValidateUnstakeValueArgs = {
  minAmount?: BigNumber;
};

export const useValidateUnstakeValue = ({
  minAmount,
}: UseValidateUnstakeValueArgs) => {
  return useCallback(
    (value: string) => {
      const amountBigNumber = parseEther(value);

      if (minAmount && amountBigNumber.lt(minAmount))
        return `Minimum unstake amount is ${formatEther(minAmount)} stETH`;

      return '';
    },
    [minAmount],
  );
};
