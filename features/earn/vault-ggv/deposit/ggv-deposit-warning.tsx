import { VaultWarning } from 'features/earn/shared/vault-warning';

import { useGGVDepositStatus } from './hooks/use-ggv-deposit-status';

const WARNING_TEXT = {
  cap: 'The vault has reached its deposit limit.',
  pause: 'The vault is paused.',
};

export const GGVDepositWarning = () => {
  const { data: depositStatus } = useGGVDepositStatus();

  if (depositStatus?.canDeposit === false) {
    return (
      <VaultWarning>
        Deposits are currently unavailable.
        {depositStatus.reason && ' ' + WARNING_TEXT[depositStatus.reason]}
      </VaultWarning>
    );
  }

  return null;
};
