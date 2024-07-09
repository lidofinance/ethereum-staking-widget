import { Eth } from '@lidofinance/lido-ui';
import { TokenAmountInputHookForm } from 'shared/hook-form/controls/token-amount-input-hook-form';
import { useStakeFormData } from '../stake-form-context';
import { useStakingLimitWarning } from 'shared/hooks/use-staking-limit-warning';
import { useIsConnectedWalletAndSupportedChain } from 'shared/hooks/use-is-connected-wallet-and-supported-chain';

export const StakeAmountInput = () => {
  const isActiveWallet = useIsConnectedWalletAndSupportedChain();
  const { maxAmount, stakingLimitInfo } = useStakeFormData();
  const { limitWarning, limitError } = useStakingLimitWarning(
    stakingLimitInfo?.stakeLimitLevel,
  );

  return (
    <TokenAmountInputHookForm
      disabled={!isActiveWallet}
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
