import { FeatureFlagsType } from './types';

export const getFeatureFlagsDefault = (): FeatureFlagsType => {
  return {
    rpcSettingsPageOnInfraIsEnabled: false,
  };
};
