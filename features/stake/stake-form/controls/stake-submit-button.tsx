import { LIMIT_LEVEL } from 'types';
import { SubmitButtonHookForm } from 'shared/hook-form/controls/submit-button-hook-form';
import { useDappStatuses } from 'shared/hooks/use-dapp-statuses';

import { useStakeFormData } from '../stake-form-context';

export const StakeSubmitButton = () => {
  const { isDappActive } = useDappStatuses();
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
