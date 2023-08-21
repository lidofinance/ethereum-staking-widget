import { useFormState } from 'react-hook-form';
import { WrapFormInputType } from '../../wrap-form-context';
import { InputGroupStyled } from 'features/wrap/styles';

export const ErrorMessageInputGroup: React.FC = ({ children }) => {
  const {
    errors: { amount: amountError },
  } = useFormState<WrapFormInputType>({ name: 'amount' });
  const errorMessage = amountError?.type === 'validate' && amountError.message;
  return (
    <InputGroupStyled error={errorMessage} fullwidth>
      {children}
    </InputGroupStyled>
  );
};
