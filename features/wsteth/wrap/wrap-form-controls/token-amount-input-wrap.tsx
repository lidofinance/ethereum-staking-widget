import { useWatch } from 'react-hook-form';
import { useWrapFormData, WrapFormInputType } from '../wrap-form-context';

import { TokenAmountInputHookForm } from 'shared/hook-form/controls/token-amount-input-hook-form';

export const TokenAmountInputWrap = () => {
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
    />
  );
};
