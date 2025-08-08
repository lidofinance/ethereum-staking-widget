import { FC } from 'react';

export const VaultPageGGV: FC<{ action: 'deposit' | 'withdraw' }> = ({
  action,
}) => {
  return <>GGV Vault - {action}</>;
};
