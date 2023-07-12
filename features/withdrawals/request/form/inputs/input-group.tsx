import { BigNumber } from 'ethers';
import { useTvlMessage } from 'features/withdrawals/hooks';
import { useFormState } from 'react-hook-form';
import { RequestFormInputType } from '../../request-form-context';
import { InputGroupStyled } from '../styles';

export const ErrorMessageInputGroup: React.FC = ({ children }) => {
  const {
    errors: { amount: valueError },
  } = useFormState<RequestFormInputType>({ name: 'amount' });
  const balanceDiff =
    valueError?.type === 'validate_tvl_joke'
      ? (valueError as unknown as { balanceDiffSteth?: BigNumber })
          ?.balanceDiffSteth
      : undefined;
  const tvlMessage = useTvlMessage(balanceDiff);
  const errorMessage = valueError?.type === 'validate' && valueError.message;
  return (
    <InputGroupStyled error={errorMessage} success={tvlMessage} fullwidth>
      {children}
    </InputGroupStyled>
  );
};
