import { useWeb3 } from 'reef-knot/web3-react';
import { useFormState } from 'react-hook-form';
import { useWrapFormData } from '../../wrap-form-context';

import { ButtonIcon, Lock } from '@lidofinance/lido-ui';
import { Connect } from 'shared/wallet';

import { RequestFormInputType } from 'features/withdrawals/request/request-form-context';

export const SubmitButton = () => {
  const { active } = useWeb3();
  const { isApprovalNeededBeforeWrap } = useWrapFormData();
  const { isValidating, isSubmitting, errors } =
    useFormState<RequestFormInputType>();

  if (!active) return <Connect fullwidth />;

  return (
    <ButtonIcon
      fullwidth
      type="submit"
      disabled={Boolean(errors.amount)}
      loading={isValidating || isSubmitting}
      icon={isApprovalNeededBeforeWrap ? <Lock /> : <></>}
      data-testid="wrapBtn"
    >
      {isApprovalNeededBeforeWrap ? 'Unlock token to wrap' : 'Wrap'}
    </ButtonIcon>
  );
};
