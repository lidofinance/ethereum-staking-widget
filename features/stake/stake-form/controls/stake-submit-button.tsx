import { SubmitButtonHookForm } from 'shared/hook-form/controls/submit-button-hook-form';
import { useStakingLimitWarn } from '../hooks';

export const StakeSubmitButton = () => {
  const { limitReached } = useStakingLimitWarn();
  return (
    <SubmitButtonHookForm disabled={limitReached} errorField="amount">
      Stake
    </SubmitButtonHookForm>
  );
};
