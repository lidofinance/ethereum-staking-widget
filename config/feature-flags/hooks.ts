import { useContext, useMemo } from 'react';
import invariant from 'tiny-invariant';

import { ConfigContext } from '../provider';
import { FeatureFlagsContextType } from './context-hook';
import { FeatureFlagsType } from './types';

type UseFeatureFlagReturnType = {
  [key in keyof FeatureFlagsType]: boolean;
} & {
  setFeatureFlag: (featureFlag: keyof FeatureFlagsType, value: boolean) => void;
};

export const useFeatureFlag = (
  flag: keyof FeatureFlagsType,
): UseFeatureFlagReturnType | null => {
  const context = useContext(ConfigContext);
  invariant(context, 'Attempt to use `feature flag` outside of provider');
  return useMemo(() => {
    return {
      [flag]: context.featureFlags[flag],
      setFeatureFlag: context.featureFlags?.setFeatureFlag,
    };
  }, [context.featureFlags, flag]);
};

export const useFeatureFlags = (): FeatureFlagsContextType | null => {
  const context = useContext(ConfigContext);
  invariant(context, 'Attempt to use `feature flag` outside of provider');
  return useMemo(() => context.featureFlags, [context.featureFlags]);
};
