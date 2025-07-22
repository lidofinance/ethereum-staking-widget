import { SubmitButtonHookForm } from 'shared/hook-form/controls/submit-button-hook-form';

import { useWrapFormData } from '../wrap-form-context';

export const SubmitButtonWrap = () => {
  const { shouldShowUnlockRequirement } = useWrapFormData();

  return (
    <SubmitButtonHookForm
      isLocked={shouldShowUnlockRequirement}
      errorField="amount"
      data-testid="wrapBtn"
    >
      {shouldShowUnlockRequirement ? `Unlock tokens and wrap` : 'Wrap'}
    </SubmitButtonHookForm>
  );
};
