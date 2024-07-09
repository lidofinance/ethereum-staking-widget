import { Wsteth } from '@lidofinance/lido-ui';
import { TOKENS } from '@lido-sdk/constants';

import { TokenAmountInputHookForm } from 'shared/hook-form/controls/token-amount-input-hook-form';
import { useIsConnectedWalletAndSupportedChain } from 'shared/hooks/use-is-connected-wallet-and-supported-chain';

import { useUnwrapFormData } from '../unwrap-form-context';

export const TokenAmountInputUnwrap = () => {
  const isActiveWallet = useIsConnectedWalletAndSupportedChain();

  const { maxAmount } = useUnwrapFormData();

  return (
    <TokenAmountInputHookForm
      disabled={!isActiveWallet}
      fieldName="amount"
      token={TOKENS.WSTETH}
      data-testid="unwrapInput"
      maxValue={maxAmount}
      leftDecorator={<Wsteth />}
    />
  );
};
