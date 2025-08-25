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

  const notAvailableText = 'Switch to Ethereum Mainnet';

  return (
    <SubmitButtonHookForm disabled={disabled || !isAvailable}>
      {isAvailable ? children : notAvailableText}
    </SubmitButtonHookForm>
  );
};
