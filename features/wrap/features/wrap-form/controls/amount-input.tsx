import { useController, useWatch } from 'react-hook-form';
import { useWrapFormData, WrapFormInputType } from '../../wrap-form-context';

import { InputAmount } from 'shared/forms/components/input-amount';

import { getTokenDisplayName } from 'utils/getTokenDisplayName';

export const AmountInput = () => {
  const { maxAmount, isApprovalNeededBeforeWrap } = useWrapFormData();
  const token = useWatch<WrapFormInputType, 'token'>({ name: 'token' });
  const {
    field,
    fieldState: { error },
  } = useController<WrapFormInputType, 'amount'>({ name: 'amount' });

  return (
    <InputAmount
      fullwidth
      data-testid="wrapInput"
      error={error?.type === 'validate'}
      isLocked={isApprovalNeededBeforeWrap}
      maxValue={maxAmount}
      label={`${getTokenDisplayName(token)} amount`}
      {...field}
    />
  );
};
