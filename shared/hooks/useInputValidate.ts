import { useCallback, useEffect, useState } from 'react';

type UseInputValidationArgs = {
  value: string;
  validationFn: (value: string) => string;
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
    if (!shouldValidate || !inputTouched) {
      if (error) setError('');
      return;
    }

    const validationResult = validationFn(inputValue);
    if (error !== validationResult) setError(validationResult);
  }, [shouldValidate, error, inputValue, validationFn, inputTouched]);

  useEffect(() => {
    doValidate();
  }, [doValidate]);

  return {
    error,
    inputTouched,
    setInputTouched,
  };
};
