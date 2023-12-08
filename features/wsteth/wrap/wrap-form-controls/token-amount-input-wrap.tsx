import { useWatch } from 'react-hook-form';
import { useWrapFormData, WrapFormInputType } from '../wrap-form-context';

import { TokenAmountInputHookForm } from 'shared/hook-form/controls/token-amount-input-hook-form';
import { useStakingLimitWarning } from 'shared/hooks/use-staking-limit-warning';

export const TokenAmountInputWrap = () => {
  const token = useWatch<WrapFormInputType, 'token'>({ name: 'token' });

  const { maxAmount, isApprovalNeededBeforeWrap, stakeLimitInfo } =
    useWrapFormData();
  const { limitWarning } = useStakingLimitWarning(
    stakeLimitInfo?.stakeLimitLevel,
  );

  return (
    <TokenAmountInputHookForm
      fieldName="amount"
      token={token}
      data-testid="wrapInput"
      isLocked={isApprovalNeededBeforeWrap}
      maxValue={maxAmount}
      warning={token === 'ETH' ? limitWarning : null}
      showErrorMessage={false}
    />
  );
};
