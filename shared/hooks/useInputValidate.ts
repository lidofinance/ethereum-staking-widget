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
  const [isValidating, setIsValidating] = useState<boolean>(false);

  const doValidate = useCallback(() => {
    if (!shouldValidate || !inputTouched) {
      if (error) setError('');
      return;
    }

    setIsValidating(true);
    const validationResult = validationFn(inputValue);
    if (error !== validationResult) setError(validationResult);
    setIsValidating(false);
  }, [shouldValidate, error, inputValue, validationFn, inputTouched]);

  useEffect(() => {
    doValidate();
  }, [doValidate]);

  return {
    error,
    isValidating,
    inputTouched,
    setInputTouched,
  };
};
