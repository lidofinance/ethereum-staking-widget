import { useWeb3 } from 'reef-knot/web3-react';
import { useFormState } from 'react-hook-form';

import { ButtonIcon, Lock } from '@lidofinance/lido-ui';
import { Connect } from 'shared/wallet';

type SubmitButtonHookFormProps = Partial<
  React.ComponentProps<typeof ButtonIcon>
> & {
  isLocked?: boolean;
};

export const SubmitButtonHookForm: React.FC<SubmitButtonHookFormProps> = ({
  isLocked,
  icon,
  ...props
}) => {
  const { active } = useWeb3();
  const { isValidating, isSubmitting } = useFormState();

  if (!active) return <Connect fullwidth />;

  return (
    <ButtonIcon
      fullwidth
      type="submit"
      loading={isValidating || isSubmitting}
      icon={icon || isLocked ? <Lock /> : <></>}
      {...props}
    />
  );
};
