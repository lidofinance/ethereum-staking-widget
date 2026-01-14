import { useConfig } from 'config';
import { useRouter } from 'next/router';

export const useIsForceAllowance = () => {
  const { featureFlags } = useConfig().externalConfig;
  const { query } = useRouter();

  const isUrlForceAllowance = query.forceAllowance === 'true';
  const isFeatureFlagForceAllowance =
    featureFlags.forceAllowance?.withdrawalRequest === true;

  return isUrlForceAllowance || isFeatureFlagForceAllowance;
};
