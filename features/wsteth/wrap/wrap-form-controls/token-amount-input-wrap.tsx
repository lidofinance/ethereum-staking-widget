import { useWatch } from 'react-hook-form';
import { useWrapFormData, WrapFormInputType } from '../wrap-form-context';

import { TokenAmountInputHookForm } from 'shared/hook-form/controls/token-amount-input-hook-form';

type TokenAmountInputWrapProps = Pick<
  React.ComponentProps<typeof TokenAmountInputHookForm>,
  'warning'
>;

export const TokenAmountInputWrap = (props: TokenAmountInputWrapProps) => {
  const token = useWatch<WrapFormInputType, 'token'>({ name: 'token' });
  const { maxAmount, isApprovalNeededBeforeWrap } = useWrapFormData();

  return (
    <TokenAmountInputHookForm
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
