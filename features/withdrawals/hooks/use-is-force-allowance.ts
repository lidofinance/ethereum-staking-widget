import { useConfig } from 'config';
import { useRouter } from 'next/router';

export const useIsForceAllowance = () => {
  const { featureFlags } = useConfig().externalConfig;
  const { query } = useRouter();

  const isUrlForceAllowance = query.forceAllowance === 'enabled';
  const isFeatureFlagForceAllowance = featureFlags.forceAllowance === true;

  return isUrlForceAllowance || isFeatureFlagForceAllowance;
};
