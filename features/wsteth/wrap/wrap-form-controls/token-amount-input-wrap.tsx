import { useWatch } from 'react-hook-form';

import { TokenAmountInputHookForm } from 'shared/hook-form/controls/token-amount-input-hook-form';
import { useDappStatus } from 'shared/hooks/use-dapp-status';

import { useWrapFormData, WrapFormInputType } from '../wrap-form-context';

type TokenAmountInputWrapProps = Pick<
  React.ComponentProps<typeof TokenAmountInputHookForm>,
  'warning'
>;

export const TokenAmountInputWrap = (props: TokenAmountInputWrapProps) => {
  const { isDappActive } = useDappStatus();
  const token = useWatch<WrapFormInputType, 'token'>({ name: 'token' });
  const { maxAmount, isApprovalNeededBeforeWrap } = useWrapFormData();

  return (
    <TokenAmountInputHookForm
      disabled={!isDappActive}
      fieldName="amount"
      token={token}
      data-testid="wrapInput"
      isLocked={isApprovalNeededBeforeWrap}
      maxValue={maxAmount}
      showErrorMessage={false}
      {...props}
    />
  );
};
