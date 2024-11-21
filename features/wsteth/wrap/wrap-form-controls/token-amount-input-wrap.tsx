import { Steth } from '@lidofinance/lido-ui';
import { useWatch } from 'react-hook-form';

import { TokenAmountInputHookForm } from 'shared/hook-form/controls/token-amount-input-hook-form';
import { useDappStatus } from 'modules/web3';

import { useWrapFormData, WrapFormInputType } from '../wrap-form-context';

type TokenAmountInputWrapProps = Pick<
  React.ComponentProps<typeof TokenAmountInputHookForm>,
  'warning'
>;

export const TokenAmountInputWrap = (props: TokenAmountInputWrapProps) => {
  const { isWalletConnected, isDappActiveOnL2, isDappActive } = useDappStatus();
  const token = useWatch<WrapFormInputType, 'token'>({ name: 'token' });
  const { maxAmount, isApprovalNeededBeforeWrap } = useWrapFormData();

  return (
    <TokenAmountInputHookForm
      disabled={isWalletConnected && !isDappActive}
      fieldName="amount"
      token={token}
      data-testid="wrapInput"
      isLocked={!!isApprovalNeededBeforeWrap}
      maxValue={maxAmount}
      showErrorMessage={false}
      leftDecorator={isDappActiveOnL2 ? <Steth /> : undefined}
      {...props}
    />
  );
};
