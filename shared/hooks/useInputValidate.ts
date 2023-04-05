import { Zero } from '@ethersproject/constants';
import { BigNumber } from 'ethers';
import { formatEther, parseEther } from '@ethersproject/units';

import { isValidEtherValue } from 'utils';
import { useEffect, useRef, useState } from 'react';

type UseInputValidation = (data: {
  value: string;
  inputName: string;
  zeroValid?: boolean;
  limit?: BigNumber;
  minimum?: BigNumber;
  active: boolean;
}) => {
  ok: boolean;
  error: string | boolean;
  value: string;
};

export const useInputValidate: UseInputValidation = ({
  value,
  inputName,
  zeroValid = false,
  limit,
  minimum,
  active,
}) => {
  const amount = Number(value);
  const [inputTouched, setInputTouched] = useState(false);
  const didMountRef = useRef(false);

  useEffect(() => {
    if (didMountRef.current) setInputTouched(true);
  }, [value]);

  // skipping first render if wallet connected
  useEffect(() => {
    if (active) didMountRef.current = true;
  }, [active]);

  if (!value) {
    return {
      ok: false,
      error: inputTouched && `${inputName} is required`,
      value: '0',
    };
  }

  if (!isValidEtherValue(value)) {
    return {
      ok: false,
      error:
        inputTouched &&
        `${inputName} must be a valid number with up to 18 decimal places`,
      value: '0',
    };
  }

  if (
    Number.isNaN(amount) || // no NaN
    !Number.isFinite(amount) || // no infinity or -infinity
    value.includes('e') // no numbers in scientific notation
  ) {
    return {
      ok: false,
      error: inputTouched && `${inputName} must be a number`,
      value: '0',
    };
  }

  let amountBigNumber: BigNumber;
  try {
    amountBigNumber = parseEther(value);
  } catch {
    return {
      ok: false,
      error:
        inputTouched &&
        `${inputName} must be a valid number with up to 18 decimal places`,
      value: '0',
    };
  }

  if (amountBigNumber.lt(Zero)) {
    return {
      ok: false,
      error: inputTouched && `${inputName} must not be a negative number`,
      value: '0',
    };
  }

  if (!zeroValid) {
    if (amountBigNumber.eq(Zero)) {
      return {
        ok: false,
        error: inputTouched && `${inputName} must be greater than 0`,
        value: '0',
      };
    }
  }

  if (limit) {
    if (amountBigNumber.gt(limit)) {
      return {
        ok: false,
        error:
          inputTouched &&
          `${inputName} must not be greater than ${formatEther(limit)}`,
        value: formatEther(limit),
      };
    }
  }

  if (minimum) {
    if (amountBigNumber.lt(minimum)) {
      return {
        ok: false,
        error:
          inputTouched &&
          `Minimum unstake amount is ${formatEther(minimum)} stETH`,
        value: formatEther(minimum),
      };
    }
  }

  return { ok: true, error: false, warning: null, value };
};
