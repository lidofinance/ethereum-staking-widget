import { FC } from 'react';
import { ButtonIcon, Lock } from '@lidofinance/lido-ui';
import { useWeb3 } from '@reef-knot/web3-react';

import { Connect } from 'shared/wallet';
import { useWithdrawals } from 'features/withdrawals/contexts/withdrawals-context';

type FormButtonProps = {
  pending: boolean;
  disabled?: boolean;
  isLocked?: boolean;
};

export const FormButton: FC<FormButtonProps> = ({
  pending,
  disabled,
  isLocked,
}) => {
  const { active } = useWeb3();
  const { isPaused } = useWithdrawals();

  if (!active) return <Connect fullwidth />;

  const buttonTitle = isLocked
    ? 'Unlock tokens for withdrawal'
    : 'Request withdrawal';

  return (
    <ButtonIcon
      fullwidth
      type="submit"
      icon={isLocked ? <Lock /> : <></>}
      disabled={disabled || pending || isPaused}
      loading={pending}
    >
      {buttonTitle}
    </ButtonIcon>
  );
};
