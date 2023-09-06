import { useCallback } from 'react';
import { FormController } from 'features/wsteth/shared/form-controller/form-controller';
import { useFormContext } from 'react-hook-form';
import { WrapFormInputType } from '../wrap-form-context';

export const FormControllerWrap: React.FC = ({ children }) => {
  const {
    reset,
    getValues,
    formState: { defaultValues },
  } = useFormContext<WrapFormInputType>();

  const handleReset = useCallback(() => {
    reset({
      ...defaultValues,
      token: getValues('token'),
    });
  }, [defaultValues, getValues, reset]);

  return <FormController reset={handleReset}>{children}</FormController>;
};
