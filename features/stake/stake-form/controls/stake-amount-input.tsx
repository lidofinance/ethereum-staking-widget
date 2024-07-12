import { Eth } from '@lidofinance/lido-ui';
import { TokenAmountInputHookForm } from 'shared/hook-form/controls/token-amount-input-hook-form';
import { useStakeFormData } from '../stake-form-context';
import { useStakingLimitWarning } from 'shared/hooks/use-staking-limit-warning';
import { useConnectionStatuses } from 'shared/hooks/use-connection-statuses';

export const StakeAmountInput = () => {
  const { isDappActive } = useConnectionStatuses();
  const { maxAmount, stakingLimitInfo } = useStakeFormData();
  const { limitWarning, limitError } = useStakingLimitWarning(
    stakingLimitInfo?.stakeLimitLevel,
  );

  return (
    <TokenAmountInputHookForm
      disabled={!isDappActive}
      fieldName="amount"
      token={'ETH'}
      data-testid="stakeInput"
      leftDecorator={<Eth />}
      maxValue={maxAmount}
      error={limitError}
      warning={limitWarning}
    />
  );
};
