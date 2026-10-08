import { Eth } from '@lidofinance/lido-ui';
import { TokenAmountInputHookForm } from 'shared/hook-form/controls/token-amount-input-hook-form';
import { useDappStatus } from 'modules/web3';

import { useStakeFormData } from '../stake-form-context';

type StakeAmountInputProps = Pick<
  React.ComponentProps<typeof TokenAmountInputHookForm>,
  'warning' | 'error'
>;

export const StakeAmountInput = (props: StakeAmountInputProps) => {
  const { isWalletConnected, isDappActive } = useDappStatus();
  const { maxAmount, token, isWethSupported } = useStakeFormData();

  return (
    <TokenAmountInputHookForm
      disabled={isWalletConnected && !isDappActive}
      fieldName="amount"
      token={token}
      data-testid="stakeInput"
      maxValue={maxAmount}
      showErrorMessage={false}
      // the token select carries the icon when it is shown
      leftDecorator={isWethSupported ? undefined : <Eth />}
      {...props}
    />
  );
};
