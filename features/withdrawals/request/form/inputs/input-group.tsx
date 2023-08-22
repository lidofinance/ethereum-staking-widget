import { useTvlMessage } from 'features/withdrawals/hooks';
import { useFormState } from 'react-hook-form';
import { isValidationErrorTypeDefault } from 'shared/hook-form/validation-error';
import { RequestFormInputType } from '../../request-form-context';
import { InputGroupStyled } from '../styles';

export const ErrorMessageInputGroup: React.FC = ({ children }) => {
  const {
    errors: { amount: amountError },
  } = useFormState<RequestFormInputType>({ name: 'amount' });
  const { tvlMessage } = useTvlMessage(amountError);
  const errorMessage =
    isValidationErrorTypeDefault(amountError?.type) && amountError?.message;
  return (
    <InputGroupStyled error={errorMessage} success={tvlMessage} fullwidth>
      {children}
    </InputGroupStyled>
  );
};
