import { Eth } from '@lidofinance/lido-ui';
import { TokenAmountInputHookForm } from 'shared/hook-form/controls/token-amount-input-hook-form';
import { useDappStatus } from 'modules/web3';
import { useL2StakeFormData } from '../l2-stake-form-context';

export const L2StakeAmountInput = () => {
  const { isWalletConnected, isDappActive } = useDappStatus();
  const { maxAmount } = useL2StakeFormData();

  return (
    <TokenAmountInputHookForm
      disabled={isWalletConnected && !isDappActive}
      fieldName="amount"
      token={'ETH'}
      maxValue={maxAmount}
      data-testid="stakeInput"
      leftDecorator={<Eth />}
    />
  );
};
