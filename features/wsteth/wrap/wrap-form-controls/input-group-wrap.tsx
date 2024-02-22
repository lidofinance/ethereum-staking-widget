import { PropsWithChildren } from 'react';
import { useWatch } from 'react-hook-form';
import { InputGroupHookForm } from 'shared/hook-form/controls/input-group-hook-form';
import { useStakingLimitWarning } from 'shared/hooks/use-staking-limit-warning';
import { WrapFormInputType, useWrapFormData } from '../wrap-form-context';

export const InputGroupWrap: React.FC<PropsWithChildren> = ({ children }) => {
  const token = useWatch<WrapFormInputType, 'token'>({ name: 'token' });
  const { stakeLimitInfo } = useWrapFormData();
  const { limitWarning } = useStakingLimitWarning(
    stakeLimitInfo?.stakeLimitLevel,
  );
  return (
    <InputGroupHookForm
      warning={token === 'ETH' ? limitWarning : undefined}
      errorField="amount"
    >
      {children}
    </InputGroupHookForm>
  );
};
