import { SubmitButtonHookForm } from 'shared/hook-form/controls/submit-button-hook-form';
import { useDappStatus } from 'shared/hooks/use-dapp-status';

import { useUnwrapFormData } from '../unwrap-form-context';

export const SubmitButtonUnwrap = () => {
  const { isDappActiveAndNetworksMatched } = useDappStatus();
  const { isMultisig, isApprovalNeededBeforeUnwrap: isLocked } =
    useUnwrapFormData();

  return (
    <SubmitButtonHookForm
      errorField="amount"
      data-testid="unwrapSubmitBtn"
      disabled={!isDappActiveAndNetworksMatched}
    >
      {isLocked
        ? `Unlock tokens ${isMultisig ? 'to' : 'and'} unwrap`
        : 'Unwrap'}
    </SubmitButtonHookForm>
  );
};
