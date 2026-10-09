import { Eth } from '@lidofinance/lido-ui';
import { TokenAmountInputHookForm } from 'shared/hook-form/controls/token-amount-input-hook-form';
import { useDappStatus } from 'modules/web3';
import { useL2StakeFormData } from '../l2-stake-form-context';

export const L2StakeAmountInput = () => {
  const { isWalletConnected, isDappActive } = useDappStatus();
  const { maxAmount, token, isWethSupported, shouldShowUnlockRequirement } =
    useL2StakeFormData();

  return (
    <TokenAmountInputHookForm
      disabled={isWalletConnected && !isDappActive}
      fieldName="amount"
      token={token}
      maxValue={maxAmount}
      isLocked={shouldShowUnlockRequirement}
      showErrorMessage={false}
      data-testid="stakeInput"
      // the token select carries the icon when it is shown
      leftDecorator={isWethSupported ? undefined : <Eth />}
    />
  );
};
