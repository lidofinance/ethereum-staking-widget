import { Eth } from '@lidofinance/lido-ui';
import { TokenAmountInputHookForm } from 'shared/hook-form/controls/token-amount-input-hook-form';
import { useStakeFormData } from '../stake-form-context';
import { useStakingLimitWarn } from '../hooks';
import { useWeb3 } from 'reef-knot/web3-react';

export const StakeAmountInput = () => {
  const { active } = useWeb3();
  const { maxAmount, stakingLimitInfo } = useStakeFormData();
  const { limitWarning } = useStakingLimitWarn(
    stakingLimitInfo?.stakeLimitLevel,
  );
  return (
    <TokenAmountInputHookForm
      fieldName="amount"
      token={'ETH'}
      leftDecorator={<Eth />}
      maxValue={maxAmount}
      warning={active ? limitWarning : null}
    />
  );
};
