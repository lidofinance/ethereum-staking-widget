import { useFormContext } from 'react-hook-form';
import {
  RequestFormInputType,
  useRequestFormData,
} from '../request-form-context';
import { ButtonIcon, Lock } from '@lidofinance/lido-ui';
import { useWeb3 } from '@reef-knot/web3-react';

import { Connect } from 'shared/wallet';
import { useWithdrawals } from 'features/withdrawals/contexts/withdrawals-context';

export const SubmitButton = () => {
  const { isTokenLocked } = useRequestFormData();
  const { active } = useWeb3();
  const { isPaused } = useWithdrawals();
  /// useFormState state subscription breaks on unmount
  const {
    formState: { isValidating, isSubmitting, errors },
  } = useFormContext<RequestFormInputType>();

  if (!active) return <Connect fullwidth />;

  const buttonTitle = isTokenLocked
    ? 'Unlock tokens for withdrawal'
    : 'Request withdrawal';

  return (
    <ButtonIcon
      fullwidth
      type="submit"
      icon={isTokenLocked ? <Lock /> : <></>}
      disabled={!!errors.amount || isPaused}
      loading={isValidating || isSubmitting}
    >
      {buttonTitle}
    </ButtonIcon>
  );
};
