import { ReactNode } from 'react';
import { VaultWarning } from 'features/earn/shared/vault-warning';

type VaultListWarningProps = {
  isVaultAvailable: boolean;
  warningText?: ReactNode;
};

export const VaultListWarning = ({
  isVaultAvailable,
  warningText,
}: VaultListWarningProps) => {
  // Without this check, the warning can be displayed even if the vault is generally disabled
  if (!isVaultAvailable) return null;

  if (!warningText) return null;

  return (
    <VaultWarning>
      {warningText} Follow{' '}
      <a href="https://x.com/LidoFinance" target="_blank" rel="noreferrer">
        Lido on X
      </a>{' '}
      for the latest updates.
    </VaultWarning>
  );
};
