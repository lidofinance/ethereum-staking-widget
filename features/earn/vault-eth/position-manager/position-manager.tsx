import type { FC } from 'react';

import { EthVaultDepositForm } from '../deposit';
import { EthVaultWithdrawForm } from '../withdraw';
import {
  EARN_VAULT_DEPOSIT_SLUG,
  EARN_VAULT_WITHDRAW_SLUG,
} from '../../consts';

export const EthVaultPositionManager: FC<{
  action: typeof EARN_VAULT_DEPOSIT_SLUG | typeof EARN_VAULT_WITHDRAW_SLUG;
}> = ({ action }) => {
  const isDeposit = action === EARN_VAULT_DEPOSIT_SLUG;
  const isWithdraw = action === EARN_VAULT_WITHDRAW_SLUG;
  return (
    <>
      {isDeposit && <EthVaultDepositForm />}
      {isWithdraw && <EthVaultWithdrawForm />}
    </>
  );
};
