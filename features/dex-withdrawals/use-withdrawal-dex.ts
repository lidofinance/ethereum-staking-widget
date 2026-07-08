import { useConfig } from 'config';
import type { ManifestConfigDexIntegration } from 'config/external-config';
import { useIsLedgerLive } from 'shared/hooks/useIsLedgerLive';

const INTEGRATION_LABEL: {
  [key in ManifestConfigDexIntegration]: string;
} = {
  cowswap: 'CowSwap',
};

export const useWithdrawalDex = () => {
  const isLedgerLive = useIsLedgerLive();
  const { enabled, integration } = useConfig().externalConfig.withdrawalDex;
  const label = INTEGRATION_LABEL[integration];

  return {
    enabled: enabled && !isLedgerLive,
    integration,
    label,
  };
};
