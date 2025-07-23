import { SubmitButtonHookForm } from 'shared/hook-form/controls/submit-button-hook-form';

import { useUnwrapFormData } from '../unwrap-form-context';

export const SubmitButtonUnwrap = () => {
  const { shouldShowUnlockRequirement } = useUnwrapFormData();

  return (
    <SubmitButtonHookForm
      isLocked={shouldShowUnlockRequirement}
      errorField="amount"
      data-testid="unwrapSubmitBtn"
    >
      {shouldShowUnlockRequirement ? `Unlock tokens and unwrap` : 'Unwrap'}
    </SubmitButtonHookForm>
  );
};
