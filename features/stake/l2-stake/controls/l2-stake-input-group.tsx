import { InputGroupHookForm } from 'shared/hook-form/controls/input-group-hook-form';
import { StakeTokenSelect } from 'features/stake/shared/stake-token-select';

import { useL2StakeFormData } from '../l2-stake-form-context';
import { L2StakeAmountInput } from './l2-stake-amount-input';

export const L2StakeInputGroup = () => {
  const { isWethSupported } = useL2StakeFormData();

  return (
    <InputGroupHookForm errorField="amount">
      {isWethSupported && <StakeTokenSelect />}
      <L2StakeAmountInput />
    </InputGroupHookForm>
  );
};
