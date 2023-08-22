import { useWeb3 } from 'reef-knot/web3-react';
import { useFormState } from 'react-hook-form';
import { useWrapFormData } from '../wrap-form-context';

import { ButtonIcon, Lock } from '@lidofinance/lido-ui';
import { Connect } from 'shared/wallet';

import type { RequestFormInputType } from 'features/withdrawals/request/request-form-context';
import { isValidationErrorTypeUnhandled } from 'shared/hook-form/validation-error';

export const SubmitButton = () => {
  const { active } = useWeb3();
  const { isApprovalNeededBeforeWrap } = useWrapFormData();
  const { isValidating, isSubmitting, errors } =
    useFormState<RequestFormInputType>();
  const disabled =
    !!errors.amount && !isValidationErrorTypeUnhandled(errors.amount.type);

  if (!active) return <Connect fullwidth />;

  return (
    <ButtonIcon
      fullwidth
      type="submit"
      disabled={disabled}
      loading={isValidating || isSubmitting}
      icon={isApprovalNeededBeforeWrap ? <Lock /> : <></>}
      data-testid="wrapBtn"
    >
      {isApprovalNeededBeforeWrap ? 'Unlock token to wrap' : 'Wrap'}
    </ButtonIcon>
  );
};
