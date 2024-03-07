import { useWatch } from 'react-hook-form';
import { InputGroupHookForm } from 'shared/hook-form/controls/input-group-hook-form';
import { useStakingLimitWarning } from 'shared/hooks/use-staking-limit-warning';
import { WrapFormInputType, useWrapFormData } from '../wrap-form-context';
import { TokenAmountInputWrap } from './token-amount-input-wrap';
import { TokenSelectWrap } from './token-select-wrap';

export const InputGroupWrap: React.FC = () => {
  const token = useWatch<WrapFormInputType, 'token'>({ name: 'token' });
  const { stakeLimitInfo } = useWrapFormData();
  const { limitWarning } = useStakingLimitWarning(
    stakeLimitInfo?.stakeLimitLevel,
  );
  const hasWarning = !!(token === 'ETH' && limitWarning);
  const warningText = hasWarning ? limitWarning : null;
  return (
    <InputGroupHookForm warning={warningText} errorField="amount">
      <TokenSelectWrap warning={hasWarning} />
      <TokenAmountInputWrap warning={hasWarning} />
    </InputGroupHookForm>
  );
};
