import { useWrapFormData } from '../wrap-form-context';

import { TokenAmountInputHookForm } from 'shared/hook-form/controls/token-amount-input-hook-form';

export const TokenAmountInputWrap = () => {
  const { maxAmount, isApprovalNeededBeforeWrap } = useWrapFormData();

  return (
    <TokenAmountInputHookForm
      data-testid="wrapInput"
      isLocked={isApprovalNeededBeforeWrap}
      maxValue={maxAmount}
    />
  );
};
