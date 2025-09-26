import { useFormState } from 'react-hook-form';
import { useSTGAvailable } from '../hooks/use-stg-available';
import { SubmitButtonHookForm } from 'shared/hook-form/controls/submit-button-hook-form';
import { useSTGDepositForm } from './form-context';

export const STGDepositSubmitButton = () => {
  const { disabled } = useFormState();
  const { isDepositLockedForCurrentToken } = useSTGDepositForm();
  const { isSTGAvailable } = useSTGAvailable();

  const shouldSwitchChain = !isSTGAvailable;

  return (
    <SubmitButtonHookForm
      disabled={disabled || shouldSwitchChain || isDepositLockedForCurrentToken}
      data-testid="submit-btn"
    >
      {shouldSwitchChain ? 'Switch to Ethereum Mainnet' : 'Deposit'}
    </SubmitButtonHookForm>
  );
};
