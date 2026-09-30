import { Eth } from '@lidofinance/lido-ui';
import { TokenAmountInputHookForm } from 'shared/hook-form/controls/token-amount-input-hook-form';
// import { useStakeFormData } from '../stake-form-context';
import { useDappStatus } from 'modules/web3';

export const L2StakeAmountInput = () => {
  const { isWalletConnected, isDappActive } = useDappStatus();
  //const { maxAmount, stakingLimitInfo } = useStakeFormData();

  return (
    <TokenAmountInputHookForm
      disabled={isWalletConnected && !isDappActive}
      fieldName="amount"
      token={'ETH'}
      data-testid="stakeInput"
      leftDecorator={<Eth />}
    />
  );
};
