import { useDappStatus } from 'modules/web3';
import { SubmitButtonHookForm } from 'shared/hook-form/controls/submit-button-hook-form';
import { isGGVAvailable } from '../utils';
import { useFormState } from 'react-hook-form';

export const GGVDepositSubmitButton = () => {
  const { chainId } = useDappStatus();
  const { disabled } = useFormState();

  const isAvailable = isGGVAvailable(chainId);

  const notAvailableText = 'Switch to Ethereum Mainnet';

  return (
    <SubmitButtonHookForm disabled={disabled || !isAvailable}>
      {isAvailable ? 'Deposit' : notAvailableText}
    </SubmitButtonHookForm>
  );
};
