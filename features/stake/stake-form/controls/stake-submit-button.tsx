import { SubmitButtonHookForm } from 'shared/hook-form/controls/submit-button-hook-form';
import { useStakeFormData } from '../stake-form-context';
import { LIMIT_LEVEL } from 'types';

export const StakeSubmitButton = () => {
  const { stakingLimitInfo } = useStakeFormData();
  return (
    <SubmitButtonHookForm
      disabled={stakingLimitInfo?.stakeLimitLevel === LIMIT_LEVEL.REACHED}
      data-testid="stakeSubmitBtn"
      errorField="amount"
    >
      Stake
    </SubmitButtonHookForm>
  );
};
