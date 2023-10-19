import { Eth } from '@lidofinance/lido-ui';
import { TokenAmountInputHookForm } from 'shared/hook-form/controls/token-amount-input-hook-form';
import { useStakeFormData } from '../stake-form-context';
import { useStakingLimitWarn } from '../hooks';

export const StakeAmountInput = () => {
  const { maxAmount } = useStakeFormData();
  const { limitWarning } = useStakingLimitWarn();
  return (
    <TokenAmountInputHookForm
      fieldName="amount"
      token={'ETH'}
      leftDecorator={<Eth />}
      maxValue={maxAmount}
      warning={limitWarning}
    />
  );
};
