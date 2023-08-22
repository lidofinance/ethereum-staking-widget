import { useFormState } from 'react-hook-form';
import { WrapFormInputType } from '../../wrap-form-context';
import { InputGroupStyled } from 'features/wrap/styles';
import { isValidationErrorTypeDefault } from 'shared/hook-form/validation-error';

export const ErrorMessageInputGroup: React.FC = ({ children }) => {
  const {
    errors: { amount: amountError },
  } = useFormState<WrapFormInputType>({ name: 'amount' });
  const errorMessage =
    isValidationErrorTypeDefault(amountError?.type) && amountError?.message;
  return (
    <InputGroupStyled error={errorMessage} fullwidth>
      {children}
    </InputGroupStyled>
  );
};
