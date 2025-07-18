import { Wsteth } from '@lidofinance/lido-ui';
import { TokenAmountInputHookForm } from 'shared/hook-form/controls/token-amount-input-hook-form';
import { useDappStatus } from 'modules/web3';

import { useUnwrapFormData } from '../unwrap-form-context';
import { TOKENS_TO_WRAP } from '../../shared/types';

export const TokenAmountInputUnwrap = () => {
  const { isWalletConnected, isDappActive } = useDappStatus();
  const { maxAmount, needsApprove } = useUnwrapFormData();

  return (
    <TokenAmountInputHookForm
      disabled={isWalletConnected && !isDappActive}
      isLocked={needsApprove}
      fieldName="amount"
      token={TOKENS_TO_WRAP.wstETH}
      data-testid="unwrapInput"
      maxValue={maxAmount}
      leftDecorator={<Wsteth />}
    />
  );
};
