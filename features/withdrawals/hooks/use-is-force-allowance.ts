import { useConfig } from 'config';
import { useRouter } from 'next/router';
import { useState } from 'react';

export const useIsForceAllowance = () => {
  const [isUserStateForceAllowance, setIsUserStateForceAllowance] =
    useState(false);
  const { featureFlags } = useConfig().externalConfig;
  const { query } = useRouter();

  const isUrlForceAllowance = query.forceAllowance === 'enabled';
  const isFeatureFlagForceAllowance = featureFlags.forceAllowance === true;
  const isForceAllowance =
    isUrlForceAllowance ||
    isFeatureFlagForceAllowance ||
    isUserStateForceAllowance;

  return [isForceAllowance, setIsUserStateForceAllowance] as const;
};
