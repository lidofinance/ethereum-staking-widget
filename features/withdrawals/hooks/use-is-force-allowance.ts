import { useConfig } from 'config';
import { useSearchParams } from 'react-router';
import { useState } from 'react';

export const useIsForceAllowance = () => {
  const [isUserStateForceAllowance, setIsUserStateForceAllowance] =
    useState(false);
  const { featureFlags } = useConfig().externalConfig;
  const [searchParams] = useSearchParams();

  const isUrlForceAllowance = searchParams.get('forceAllowance') === 'enabled';
  const isFeatureFlagForceAllowance = featureFlags.forceAllowance === true;
  const isForceAllowance =
    isUrlForceAllowance ||
    isFeatureFlagForceAllowance ||
    isUserStateForceAllowance;

  return [isForceAllowance, setIsUserStateForceAllowance] as const;
};
