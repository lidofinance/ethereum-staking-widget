import { FC, PropsWithChildren } from 'react';
import { useTvlMessage } from 'features/withdrawals/hooks';
import { useFormState } from 'react-hook-form';
import { InputGroupHookForm } from 'shared/hook-form/controls/input-group-hook-form';
import { RequestFormInputType } from '../../request-form-context';

export const InputGroupRequest: FC<PropsWithChildren> = ({ children }) => {
  const {
    errors: { amount: amountError },
  } = useFormState<RequestFormInputType>({ name: 'amount' });
  const { tvlMessage } = useTvlMessage(amountError);
  return (
    <InputGroupHookForm errorField="amount" success={tvlMessage}>
      {children}
    </InputGroupHookForm>
  );
};
