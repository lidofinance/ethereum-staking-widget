import { useFormState } from 'react-hook-form';
import { SubmitButtonHookForm } from 'shared/hook-form/controls/submit-button-hook-form';

type VaultSubmitButtonProps = React.PropsWithChildren<{
  isAvailable?: boolean;
}>;

export const VaultSubmitButton = ({
  isAvailable,
  children,
}: VaultSubmitButtonProps) => {
  const { disabled } = useFormState();

  const shouldSwitchChain = !isAvailable;

  return (
    <SubmitButtonHookForm
      disabled={disabled || shouldSwitchChain}
      data-testid="submit-btn"
    >
      {shouldSwitchChain ? 'Switch to Ethereum Mainnet' : children}
    </SubmitButtonHookForm>
  );
};
