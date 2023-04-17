import { useCallback, useState } from 'react';
import { useCurrencyMaxAmount } from 'shared/forms/hooks/useCurrencyMaxAmount';
import { useInputValidate } from 'shared/forms/hooks/useInputValidate';
import { useCurrencyAmountValidator } from 'shared/forms/hooks/useCurrencyAmountValidator';

import { BigNumber } from 'ethers';
import type { ValidationFn } from 'shared/forms/types/validation-fn';

type UseCurrencyInputArgs = {
  inputValue: string;
  setInputValue: (inputValue: string) => void;
  inputName?: string;
  initialValue?: string;
  limit?: BigNumber;
  submit: (inputValue: string, reset: () => void) => Promise<void>;
  token?: string;
  padMaxAmount?: boolean | ((padAmount: BigNumber) => boolean);
  gasLimit?: number;
  extraValidationFn?: ValidationFn;
  shouldValidate?: boolean;
};

export const useCurrencyInput = ({
  inputValue,
  setInputValue,
  inputName = 'Amount',
  initialValue = '',
  limit,
  submit,
  token = 'ETH',
  padMaxAmount,
  gasLimit,
  extraValidationFn,
  shouldValidate = true,
}: UseCurrencyInputArgs) => {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const validationFn = useCurrencyAmountValidator({
    inputName,
    limit,
    extraValidationFn,
  });

  const { doValidate, error, inputTouched, setInputTouched } = useInputValidate(
    {
      value: inputValue,
      validationFn,
      shouldValidate,
    },
  );

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (!inputTouched) setInputTouched(true);
      setInputValue(event?.currentTarget.value);
    },
    [inputTouched, setInputTouched, setInputValue],
  );

  const reset = useCallback(() => {
    setIsSubmitting(false);
    setInputValue(initialValue);
    setInputTouched(false);
  }, [initialValue, setInputTouched, setInputValue]);

  const handleSubmit = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();
      const isValid = doValidate();
      if (isValid) {
        setIsSubmitting(true);
        await submit(inputValue, reset);
        setIsSubmitting(false);
      }
    },
    [inputValue, reset, submit, doValidate],
  );

  const maxAmount = useCurrencyMaxAmount({
    limit: limit ? limit : BigNumber.from(0),
    token,
    padded: padMaxAmount,
    gasLimit,
  });

  const isMaxDisabled = maxAmount === '0.0';

  const setMaxInputValue = useCallback(() => {
    if (!isMaxDisabled) setInputValue(maxAmount);
  }, [maxAmount, setInputValue, isMaxDisabled]);

  return {
    handleChange,
    handleSubmit,
    setMaxInputValue,
    error,
    reset,
    isSubmitting,
    isMaxDisabled,
  };
};
