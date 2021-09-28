import { Zero } from '@ethersproject/constants';
import { formatEther, parseEther } from '@ethersproject/units';
import { BigNumber } from 'ethers';
import React, {
  FormEventHandler,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { HandleChange } from 'types';
import { useMaxAmount } from 'hooks';

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
}) => {
  const [inputValue, setInputValue] = useState(initialValue);
  const [error, setError] = useState(initialError);
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
    setInputValue(initialValue);
    setError(initialError);
    setShouldValidate(validateOnMount);
    setIsValidating(false);
    setIsSubmitting(false);
  }, [initialError, initialValue, validateOnMount]);

  const validate: (value: string) => boolean = useCallback(
    (value: string) => {
      startValidating();

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
    [startValidating, zeroValid, limit, inputName, stopValidating],
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
    balance: limit ? limit : BigNumber.from(0),
    token,
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

  return {
    inputValue,
    handleChange,
    error,
    isValidating,
    isSubmitting,
    handleSubmit,
    reset,
    setMaxInputValue,
  };
};
