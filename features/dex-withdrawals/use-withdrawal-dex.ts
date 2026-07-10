import { useConfig } from 'config';
import type { ManifestConfigDexIntegration } from 'config/external-config';

const INTEGRATION_LABEL: {
  [key in ManifestConfigDexIntegration]: string;
} = {
  cowswap: 'CowSwap',
};

export const useWithdrawalDex = () => {
  const { enabled, integration } = useConfig().externalConfig.withdrawalDex;
  const label = INTEGRATION_LABEL[integration];

  return {
    enabled,
    integration,
    label,
  };
};
