import { SubmitButtonHookForm } from 'shared/hook-form/controls/submit-button-hook-form';
import { useDappStatus } from 'modules/web3';

import { useL2StakeFormData } from '../l2-stake-form-context';

export const L2StakeSubmitButton = () => {
  const { isDappActive } = useDappStatus();
  const { shouldShowUnlockRequirement } = useL2StakeFormData();

  return (
    <SubmitButtonHookForm
      disabled={!isDappActive}
      isLocked={shouldShowUnlockRequirement}
      data-testid="stakeSubmitBtn"
      errorField="amount"
    >
      {shouldShowUnlockRequirement ? 'Unlock WETH and stake' : 'Stake'}
    </SubmitButtonHookForm>
  );
};
