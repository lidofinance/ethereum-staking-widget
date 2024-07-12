import { useWatch } from 'react-hook-form';

import { TokenAmountInputHookForm } from 'shared/hook-form/controls/token-amount-input-hook-form';
import { useDappStatuses } from 'shared/hooks/use-dapp-statuses';

import { useWrapFormData, WrapFormInputType } from '../wrap-form-context';

type TokenAmountInputWrapProps = Pick<
  React.ComponentProps<typeof TokenAmountInputHookForm>,
  'warning'
>;

export const TokenAmountInputWrap = (props: TokenAmountInputWrapProps) => {
  const { isDappActive } = useDappStatuses();
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
