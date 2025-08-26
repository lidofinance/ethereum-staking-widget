import { useFormState } from 'react-hook-form';
import { useDappStatus } from 'modules/web3';
import { SubmitButtonHookForm } from 'shared/hook-form/controls/submit-button-hook-form';

type VaultSubmitButtonProps = React.PropsWithChildren<{
  isAvailable?: boolean;
}>;

export const VaultSubmitButton = ({
  isAvailable,
  children,
}: VaultSubmitButtonProps) => {
  const { isSupportedChain } = useDappStatus();
  const { disabled } = useFormState();

  let notAvailableText = 'Switch to Ethereum Mainnet';

  if (!isSupportedChain) {
    notAvailableText = 'Unsupported chain';
    isAvailable = false;
  }

  return (
    <SubmitButtonHookForm disabled={disabled || !isAvailable}>
      {isAvailable ? children : notAvailableText}
    </SubmitButtonHookForm>
  );
};
