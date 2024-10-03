import { SubmitButtonHookForm } from 'shared/hook-form/controls/submit-button-hook-form';
import { useDappStatus } from 'shared/hooks/use-dapp-status';

import { useWrapFormData } from '../wrap-form-context';

export const SubmitButtonWrap = () => {
  const { isDappActiveAndNetworksMatched } = useDappStatus();
  const { isMultisig, isApprovalNeededBeforeWrap: isLocked } =
    useWrapFormData();

  return (
    <SubmitButtonHookForm
      isLocked={isLocked}
      errorField="amount"
      data-testid="wrapBtn"
      disabled={!isDappActiveAndNetworksMatched}
    >
      {isLocked ? `Unlock tokens ${isMultisig ? 'to' : 'and'} wrap` : 'Wrap'}
    </SubmitButtonHookForm>
  );
};
