import { InputGroupHookForm } from 'shared/hook-form/controls/input-group-hook-form';
import { useStakingLimitWarning } from 'modules/web3';

import { useStakeFormData } from '../stake-form-context';
import { StakeAmountInput } from './stake-amount-input';
import { StakeTokenSelect } from 'features/stake/shared/stake-token-select';

export const StakeInputGroup = () => {
  const { stakingLimitInfo, isWethSupported } = useStakeFormData();
  const { limitWarning, limitError } = useStakingLimitWarning(
    stakingLimitInfo?.stakeLimitLevel,
  );

  // the group reads validation errors itself; the limit error overrides them
  const limitErrorProps = limitError ? { error: limitError } : {};

  return (
    <InputGroupHookForm
      warning={limitWarning}
      errorField="amount"
      bottomSpacing={0}
      {...limitErrorProps}
    >
      {isWethSupported && <StakeTokenSelect warning={!!limitWarning} />}
      <StakeAmountInput
        warning={!!limitWarning}
        error={limitError ? true : undefined}
      />
    </InputGroupHookForm>
  );
};
