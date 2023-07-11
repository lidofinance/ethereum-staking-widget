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
  /// useFormState state subscription breaks on unmount
  const {
    formState: { isValidating, isSubmitting, isValid, isDirty },
  } = useFormContext<RequestFormInputType>();
  const { isTokenLocked } = useRequestFormData();
  const { active } = useWeb3();
  const { isPaused } = useWithdrawals();

  if (!active) return <Connect fullwidth />;

  const buttonTitle = isTokenLocked
    ? 'Unlock tokens for withdrawal'
    : 'Request withdrawal';

  return (
    <ButtonIcon
      fullwidth
      type="submit"
      icon={isTokenLocked ? <Lock /> : <></>}
      disabled={(isDirty && !isValid) || isPaused}
      loading={isValidating || isSubmitting}
    >
      {buttonTitle}
    </ButtonIcon>
  );
};
