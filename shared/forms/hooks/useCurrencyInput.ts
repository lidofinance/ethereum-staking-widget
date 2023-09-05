import { useCallback, useState } from 'react';
import { useCurrencyMaxAmount } from 'shared/forms/hooks/useCurrencyMaxAmount';
import { useInputValidate } from 'shared/forms/hooks/useInputValidate';
import { useCurrencyAmountValidator } from 'shared/forms/hooks/useCurrencyAmountValidator';

import { BigNumber } from 'ethers';
import { maxNumberValidation } from 'utils/maxNumberValidation';

type UseCurrencyInputArgs = {
  inputValue: string;
  setInputValue: (inputValue: string) => void;
  inputName?: string;
  resetValue?: string;
  limit?: BigNumber;
  submit: (inputValue: string, reset: () => void) => Promise<void>;
  token?: string;
  padMaxAmount?: boolean | ((padAmount: BigNumber) => boolean);
  gasLimit?: number;
  shouldValidate?: boolean;
};

export const useCurrencyInput = ({
  inputValue,
  setInputValue,
  inputName = 'Amount',
  resetValue = '',
  limit,
  submit,
  token = 'ETH',
  padMaxAmount,
  gasLimit,
  shouldValidate = true,
}: UseCurrencyInputArgs) => {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const validationFn = useCurrencyAmountValidator({ inputName, limit });

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
      setInputValue(maxNumberValidation(event?.currentTarget.value));
    },
    [inputTouched, setInputTouched, setInputValue],
  );

  const reset = useCallback(() => {
    setIsSubmitting(false);
    setInputValue(resetValue);
    setInputTouched(false);
  }, [resetValue, setInputTouched, setInputValue]);

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
    gasLimit:
      typeof gasLimit === 'number' ? BigNumber.from(gasLimit) : undefined,
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
