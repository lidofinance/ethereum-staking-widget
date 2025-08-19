import { VaultWarning } from 'features/earn/shared/vault-warning';
import { useDVVDepositLimit } from './hooks/use-dvv-deposit-limit';
import { DVVDepositLimitReason } from './types';

const WARNING_TEXT: Record<DVVDepositLimitReason, string> = {
  'deposit-limit-reached': 'Vault has reached deposit limit.',
  'deposit-paused': 'Deposits are currently paused.',
  'non-whitelisted': 'Your address is not whitelisted for deposits.',
};

export const DVVDepositWarning = () => {
  const { data } = useDVVDepositLimit();

  if (data?.reason) {
    return <VaultWarning>{WARNING_TEXT[data.reason]}</VaultWarning>;
  }

  return null;
};
