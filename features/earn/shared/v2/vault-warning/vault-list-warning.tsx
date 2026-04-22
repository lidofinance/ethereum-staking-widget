import { ReactNode } from 'react';
import { VaultWarning } from 'features/earn/shared/vault-warning';

type VaultListWarningProps = {
  warningText?: ReactNode;
};

export const VaultListWarning = ({ warningText }: VaultListWarningProps) => {
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
