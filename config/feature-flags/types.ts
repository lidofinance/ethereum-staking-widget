// TODO: maybe do we wants use 'feature flags' for this?
// export const FEATURE_FLAGS_PAGE_IS_ENABLED = 'featureFlagsPageIsEnabled';
export const RPC_SETTINGS_PAGE_ON_INFRA_IS_ENABLED =
  'rpcSettingsPageOnInfraIsEnabled';

export type FeatureFlagsType = {
  // [FEATURE_FLAGS_PAGE_IS_ENABLED]: boolean;
  [RPC_SETTINGS_PAGE_ON_INFRA_IS_ENABLED]: boolean;
};
