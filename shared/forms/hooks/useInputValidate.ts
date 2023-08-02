import { useCallback, useEffect, useState } from 'react';
import type { ValidationFn } from 'shared/forms/types/validation-fn';

type UseInputValidationArgs = {
  value: string;
  validationFn: ValidationFn;
  shouldValidate: boolean;
};

export const useInputValidate = ({
  value: inputValue,
  validationFn,
  shouldValidate,
}: UseInputValidationArgs) => {
  const [error, setError] = useState('');
  const [inputTouched, setInputTouched] = useState(false);

  const doValidate = useCallback(() => {
    const validationResult = validationFn(inputValue);
    const isValid = validationResult === '';

    if (!inputTouched) setInputTouched(true);
    if (error !== validationResult) setError(validationResult);

    return isValid;
  }, [error, validationFn, inputTouched, inputValue]);

  useEffect(() => {
    if (shouldValidate && inputTouched) {
      doValidate();
    } else {
      setError('');
    }
  }, [doValidate, inputTouched, shouldValidate]);

  return {
    error,
    inputTouched,
    setInputTouched,
    doValidate,
  };
};
