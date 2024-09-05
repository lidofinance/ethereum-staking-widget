import { FC, PropsWithChildren } from 'react';
import { useTvlMessage } from 'features/withdrawals/hooks';
import { InputGroupHookForm } from 'shared/hook-form/controls/input-group-hook-form';

export const InputGroupRequest: FC<PropsWithChildren> = ({ children }) => {
  const { tvlMessage } = useTvlMessage();
  return (
    <InputGroupHookForm errorField="amount" success={tvlMessage}>
      {children}
    </InputGroupHookForm>
  );
};
