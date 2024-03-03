import { FeatureFlagsType } from './types';

export const getFeatureFlagsDefault = (): FeatureFlagsType => {
  return {
    // TODO: maybe do we wants use 'feature flags' for this?
    // featureFlagsPageIsEnabled: true,
    rpcSettingsPageOnInfraIsEnabled: false,
  };
};
