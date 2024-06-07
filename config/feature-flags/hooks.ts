import { useContext, useMemo } from 'react';
import invariant from 'tiny-invariant';

import { ConfigContext } from '../provider';
import type { FeatureFlagsContextType } from './context-hook';
import type { FeatureFlagsType } from './types';

export const useFeatureFlag = <K extends keyof FeatureFlagsType>(flag: K) => {
  const context = useContext(ConfigContext);
  invariant(context, 'Attempt to use `feature flag` outside of provider');
  return useMemo(() => {
    return {
      [flag]: context.featureFlags[flag],
      setFeatureFlag: context.featureFlags?.setFeatureFlag,
    } as {
      setFeatureFlag: FeatureFlagsContextType['setFeatureFlag'];
    } & Record<K, FeatureFlagsType[K]>;
  }, [context.featureFlags, flag]);
};
