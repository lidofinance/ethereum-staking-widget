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

  const shouldSwitchChain = !isSupportedChain || !isAvailable;

  return (
    <SubmitButtonHookForm disabled={disabled || shouldSwitchChain}>
      {shouldSwitchChain ? 'Switch to Ethereum Mainnet' : children}
    </SubmitButtonHookForm>
  );
};
