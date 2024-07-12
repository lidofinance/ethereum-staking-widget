import { LIMIT_LEVEL } from 'types';
import { SubmitButtonHookForm } from 'shared/hook-form/controls/submit-button-hook-form';
import { useConnectionStatuses } from 'shared/hooks/use-connection-statuses';

import { useStakeFormData } from '../stake-form-context';

export const StakeSubmitButton = () => {
  const { isDappActive } = useConnectionStatuses();
  const { stakingLimitInfo } = useStakeFormData();

  return (
    <SubmitButtonHookForm
      disabled={
        !isDappActive ||
        stakingLimitInfo?.stakeLimitLevel === LIMIT_LEVEL.REACHED
      }
      data-testid="stakeSubmitBtn"
      errorField="amount"
    >
      Stake
    </SubmitButtonHookForm>
  );
};
