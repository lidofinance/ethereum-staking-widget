import { Zero } from '@ethersproject/constants';
import { formatEther, parseEther } from '@ethersproject/units';
import { BigNumber } from 'ethers';
import React, {
  FormEventHandler,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { HandleChange, LIMIT_LEVEL } from 'types';
import { useMaxAmount, useStakingLimitLevel } from 'shared/hooks/index';

type UseCurrencyInputArgs = {
  inputName?: string;
  initialValue?: string;
  initialError?: string;
  validateOnMount?: boolean;
  zeroValid?: boolean;
  limit?: BigNumber;
  submit: (inputValue: string, reset: () => void) => Promise<void>;
  externalSetInputValue?: (inputValue: string) => void;
  token?: string;
  checkStakingLimit?: boolean;
  padMaxAmount?: boolean | ((padAmount: BigNumber) => boolean);
};

type UseCurrencyInputReturn = {
  inputValue: string;
  handleChange: HandleChange;
  error: string;
  isValidating: boolean;
  isSubmitting: boolean;
  handleSubmit: FormEventHandler<HTMLFormElement> | undefined;
  reset: () => void;
  setMaxInputValue: () => void;
  isMaxDisabled: boolean;
  limitWarning: string;
  limitReached?: boolean;
};

type UseCurrencyInput = (args: UseCurrencyInputArgs) => UseCurrencyInputReturn;

export const useCurrencyInput: UseCurrencyInput = ({
  inputName = 'Amount',
  initialValue = '',
  initialError = '',
  validateOnMount = false,
  zeroValid = false,
  limit,
  submit,
  externalSetInputValue,
  token = 'ETH',
  checkStakingLimit,
  padMaxAmount,
}) => {
  const [inputValue, setInputValue] = useState(initialValue);
  const [error, setError] = useState(initialError);
  const [limitWarning, setLimitWarning] = useState('');
  const [shouldValidate, setShouldValidate] = useState(validateOnMount);
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleChange: HandleChange = useCallback(
    (event) => {
      setInputValue(event?.currentTarget.value);

      if (externalSetInputValue) {
        externalSetInputValue(event?.currentTarget.value);
      }

      if (!shouldValidate) {
        setShouldValidate(true);
      }
    },
    [externalSetInputValue, shouldValidate],
  );

  const startValidating = useCallback(() => {
    setIsValidating(true);
  }, []);

  const stopValidating = useCallback(() => {
    setIsValidating(false);
  }, []);

  const reset = useCallback(() => {
    setShouldValidate(validateOnMount);
    setIsValidating(false);
    setIsSubmitting(false);
    setInputValue(initialValue);
    setError(initialError);
  }, [initialError, initialValue, validateOnMount]);

  const limitLevel = useStakingLimitLevel();

  const validate: (value: string) => boolean = useCallback(
    (value: string) => {
      startValidating();

      if (checkStakingLimit) {
        if (limitLevel === LIMIT_LEVEL.WARN) {
          setLimitWarning(
            'Stake limit is almost exhausted. Your transaction may not go through.',
          );
        } else if (limitLevel === LIMIT_LEVEL.REACHED) {
          setError(
            `Stake limit is exhausted. Please wait until the limit is restored.`,
          );
          stopValidating();
          return false;
        } else {
          setLimitWarning('');
        }
      }

      const amount = Number(value);

      if (!value) {
        setError(`${inputName} is required`);
        stopValidating();
        return false;
      }

      if (
        Number.isNaN(amount) || // no NaN
        !Number.isFinite(amount) || // no infinity or -infinity
        value.includes('e') // no numbers in scientific notation
      ) {
        setError(`${inputName} must be a number`);
        stopValidating();
        return false;
      }

      let amountBigNumber: BigNumber;
      try {
        amountBigNumber = parseEther(value);
      } catch {
        setError(
          `${inputName} must be a valid number with up to 18 decimal places`,
        );
        stopValidating();
        return false;
      }

      if (amountBigNumber.lt(Zero)) {
        setError(`${inputName} must not be a negative number`);
        stopValidating();
        return false;
      }

      if (!zeroValid) {
        if (amountBigNumber.eq(Zero)) {
          setError(`${inputName} must be greater than 0`);
          stopValidating();
          return false;
        }
      }

      if (limit) {
        if (amountBigNumber.gt(limit)) {
          setError(
            `${inputName} must not be greater than ${formatEther(limit)}`,
          );
          stopValidating();
          return false;
        }
      }

      stopValidating();
      setError('');
      return true;
    },
    [
      startValidating,
      zeroValid,
      limit,
      checkStakingLimit,
      stopValidating,
      inputName,
      limitLevel,
    ],
  );

  useEffect(() => {
    if (shouldValidate) {
      validate(inputValue);
    }
  }, [shouldValidate, validate, inputValue]);

  const handleSubmit = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();
      const isValid = validate(inputValue);
      if (isValid) {
        setIsSubmitting(true);
        await submit(inputValue, reset);
        setIsSubmitting(false);
      }
    },
    [inputValue, reset, submit, validate],
  );

  const maxAmount = useMaxAmount({
    limit: limit ? limit : BigNumber.from(0),
    token,
    padded: padMaxAmount,
  });

  const setMaxInputValue = useCallback(() => {
    // todo: maybe problems
    if (maxAmount === '0.0') {
      return;
    }

    setInputValue(maxAmount);

    if (externalSetInputValue) {
      externalSetInputValue(maxAmount);
    }
  }, [maxAmount, externalSetInputValue]);

  const isMaxDisabled = maxAmount === '0.0';

  return {
    inputValue,
    handleChange,
    error,
    isValidating,
    isSubmitting,
    handleSubmit,
    reset,
    setMaxInputValue,
    isMaxDisabled,
    limitWarning,
    limitReached: checkStakingLimit && limitLevel === LIMIT_LEVEL.REACHED,
  };
};
