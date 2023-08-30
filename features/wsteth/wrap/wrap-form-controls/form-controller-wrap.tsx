import { useCallback } from 'react';
import { FormController } from 'features/wsteth/shared/form-controller/form-controller';
import { useFormContext } from 'react-hook-form';

export const FormControllerWrap: React.FC = ({ children }) => {
  const { setValue, clearErrors } = useFormContext();

  const handleReset = useCallback(() => {
    setValue('amount', undefined);
    clearErrors('amount');
  }, [clearErrors, setValue]);

  return <FormController reset={handleReset}>{children}</FormController>;
};
