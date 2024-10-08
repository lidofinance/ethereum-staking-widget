import { LIMIT_LEVEL } from 'types';
import { SubmitButtonHookForm } from 'shared/hook-form/controls/submit-button-hook-form';
import { useDappStatus } from 'shared/hooks/use-dapp-status';

import { useStakeFormData } from '../stake-form-context';

export const StakeSubmitButton = () => {
  const { isDappActive, isAccountActiveOnL2 } = useDappStatus();
  const { stakingLimitInfo } = useStakeFormData();

  return (
    <SubmitButtonHookForm
      disabled={
        !isDappActive ||
        isAccountActiveOnL2 ||
        stakingLimitInfo?.stakeLimitLevel === LIMIT_LEVEL.REACHED
      }
      data-testid="stakeSubmitBtn"
      errorField="amount"
    >
      Stake
    </SubmitButtonHookForm>
  );
};
