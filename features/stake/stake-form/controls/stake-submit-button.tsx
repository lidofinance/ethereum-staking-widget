import { LIMIT_LEVEL } from 'types';
import { SubmitButtonHookForm } from 'shared/hook-form/controls/submit-button-hook-form';
import { useAA, useDappStatus } from 'modules/web3';

import { useStakeFormData } from '../stake-form-context';

export const StakeSubmitButton = () => {
  const { isDappActive } = useDappStatus();
  const { isAA } = useAA();
  const { stakingLimitInfo, isWeth } = useStakeFormData();

  // without batching the WETH is unwrapped in its own transaction first
  const needsSeparateUnwrap = isWeth && !isAA;

  return (
    <SubmitButtonHookForm
      disabled={
        !isDappActive ||
        stakingLimitInfo?.stakeLimitLevel === LIMIT_LEVEL.REACHED
      }
      data-testid="stakeSubmitBtn"
      errorField="amount"
    >
      {needsSeparateUnwrap ? 'Unwrap WETH and stake' : 'Stake'}
    </SubmitButtonHookForm>
  );
};
