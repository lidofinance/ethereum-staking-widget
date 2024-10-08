import { Eth } from '@lidofinance/lido-ui';
import { TokenAmountInputHookForm } from 'shared/hook-form/controls/token-amount-input-hook-form';
import { useStakeFormData } from '../stake-form-context';
import { useStakingLimitWarning } from 'shared/hooks/use-staking-limit-warning';
import { useDappStatus } from 'shared/hooks/use-dapp-status';

export const StakeAmountInput = () => {
  const { isWalletConnected, isDappActive, isAccountActiveOnL2 } =
    useDappStatus();
  const { maxAmount, stakingLimitInfo } = useStakeFormData();
  const { limitWarning, limitError } = useStakingLimitWarning(
    stakingLimitInfo?.stakeLimitLevel,
  );

  return (
    <TokenAmountInputHookForm
      disabled={(isWalletConnected && !isDappActive) || isAccountActiveOnL2}
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
