import { SubmitButtonHookForm } from 'shared/hook-form/controls/submit-button-hook-form';
import { useDappStatus } from 'modules/web3';

export const L2StakeSubmitButton = () => {
  const { isDappActive } = useDappStatus();

  return (
    <SubmitButtonHookForm
      disabled={!isDappActive}
      data-testid="stakeSubmitBtn"
      errorField="amount"
    >
      Stake
    </SubmitButtonHookForm>
  );
};
