import { useContext } from 'react';
import invariant from 'tiny-invariant';

import { FeatureFlagsContext, FeatureFlagsContextType } from './provider';
import { FeatureFlagsType } from './types';

type UseFeatureFlagReturnType = {
  [key in keyof FeatureFlagsType]: boolean;
} & {
  setFeatureFlag: (featureFlag: keyof FeatureFlagsType, value: boolean) => void;
};

export const useFeatureFlag = (
  flag: keyof FeatureFlagsType,
): UseFeatureFlagReturnType => {
  const context = useContext(FeatureFlagsContext);
  invariant(context, 'Attempt to use `feature flag` outside of provider');
  return {
    [flag]: context[flag],
    setFeatureFlag: context.setFeatureFlag,
  };
};

export const useFeatureFlags = (): FeatureFlagsContextType => {
  const context = useContext(FeatureFlagsContext);
  invariant(context, 'Attempt to use `feature flag` outside of provider');
  return context;
};
