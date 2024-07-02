import { useWeb3 } from 'reef-knot/web3-react';
import { SubmitButtonHookForm } from 'shared/hook-form/controls/submit-button-hook-form';
import { LIMIT_LEVEL } from 'types';
import { useStakeFormData } from '../stake-form-context';

export const StakeSubmitButton = () => {
  const { active } = useWeb3();
  const { stakingLimitInfo } = useStakeFormData();

  return (
    <SubmitButtonHookForm
      disabled={
        !active || stakingLimitInfo?.stakeLimitLevel === LIMIT_LEVEL.REACHED
      }
      data-testid="stakeSubmitBtn"
      errorField="amount"
    >
      Stake
    </SubmitButtonHookForm>
  );
};
