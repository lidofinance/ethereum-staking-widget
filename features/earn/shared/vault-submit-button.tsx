import { SubmitButtonHookForm } from 'shared/hook-form/controls/submit-button-hook-form';

type VaultSubmitButtonProps = React.PropsWithChildren<{
  disabled?: boolean;
  isAvailable?: boolean;
}>;

export const VaultSubmitButton = ({
  disabled,
  isAvailable,
  children,
}: VaultSubmitButtonProps) => {
  // If the vault is not available, it usually means the user is on the wrong chain
  const shouldSwitchChain = !isAvailable;

  return (
    <SubmitButtonHookForm
      disabled={disabled || shouldSwitchChain}
      data-testid="submit-btn"
    >
      {!disabled && shouldSwitchChain ? 'Switch to Ethereum Mainnet' : children}
    </SubmitButtonHookForm>
  );
};
