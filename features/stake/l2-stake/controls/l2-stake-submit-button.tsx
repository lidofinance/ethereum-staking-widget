import { SubmitButtonHookForm } from 'shared/hook-form/controls/submit-button-hook-form';
import { useDappStatus } from 'modules/web3';

import { useL2StakeFormData } from '../l2-stake-form-context';
import { capitalize } from 'lodash';

export const L2StakeSubmitButton = () => {
  const { isDappActive } = useDappStatus();
  const { shouldShowUnlockRequirement, isSlowLane } = useL2StakeFormData();

  const action = isSlowLane ? 'launch Staking Shuttle' : 'stake';

  return (
    <SubmitButtonHookForm
      disabled={!isDappActive}
      isLocked={shouldShowUnlockRequirement}
      data-testid="stakeSubmitBtn"
      errorField="amount"
    >
      {shouldShowUnlockRequirement
        ? `Unlock WETH and ${action}`
        : capitalize(action)}
    </SubmitButtonHookForm>
  );
};
