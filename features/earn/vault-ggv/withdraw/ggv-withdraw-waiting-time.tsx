import { VaultTxInfoRow } from 'features/earn/shared/vault-tx-info';

import { useGGVWithdrawForm } from './form-context';

export const GGVWithdrawWaitingTime = () => {
  const { isBulkWithdraw } = useGGVWithdrawForm();

  if (isBulkWithdraw) {
    return (
      <VaultTxInfoRow title="Waiting time" data-testid="waiting-time">
        Instant
      </VaultTxInfoRow>
    );
  }

  return (
    <VaultTxInfoRow
      title="Waiting time"
      help={
        <>
          Withdrawals usually complete within 3 days, often sooner. You can
          track progress in your wallet or in the Withdrawal section of the Lido
          GGV UI.
        </>
      }
      data-testid="waiting-time"
    >
      3 days
    </VaultTxInfoRow>
  );
};
