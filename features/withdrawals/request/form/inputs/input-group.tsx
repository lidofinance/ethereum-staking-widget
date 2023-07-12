import { useTvlMessage } from 'features/withdrawals/hooks';
import { useFormState } from 'react-hook-form';
import { RequestFormInputType } from '../../request-form-context';
import { InputGroupStyled } from '../styles';

export const ErrorMessageInputGroup: React.FC = ({ children }) => {
  const {
    errors: { amount: amountError },
  } = useFormState<RequestFormInputType>({ name: 'amount' });
  const { tvlMessage } = useTvlMessage(amountError);
  const errorMessage = amountError?.type === 'validate' && amountError.message;
  return (
    <InputGroupStyled error={errorMessage} success={tvlMessage} fullwidth>
      {children}
    </InputGroupStyled>
  );
};
