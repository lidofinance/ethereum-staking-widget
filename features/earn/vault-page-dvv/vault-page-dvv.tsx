import { FC } from 'react';

export const VaultPageDVV: FC<{ action: 'deposit' | 'withdraw' }> = ({
  action,
}) => {
  return <>DVV Vault - {action}</>;
};
