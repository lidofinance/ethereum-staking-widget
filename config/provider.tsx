import { PropsWithChildren, createContext, useMemo } from 'react';

import { getConfig, ConfigType } from './get-config';
import { useUserConfigContext, UserConfigContextType } from './user-config';
import {
  useFeatureFlagsContext,
  FeatureFlagsContextType,
} from './feature-flags';
import {
  type ExternalConfig,
  useExternalConfigContext,
} from './external-config';

type ConfigProviderType = {
  config: ConfigType;
  userConfig: UserConfigContextType;
  featureFlags: FeatureFlagsContextType;
  externalConfig: ExternalConfig;
};

export const ConfigContext = createContext<ConfigProviderType | null>(null);

type ConfigProviderProps = {
  prefetchedManifest?: unknown;
};

export const ConfigProvider = ({
  children,
  prefetchedManifest,
}: PropsWithChildren<ConfigProviderProps>) => {
  const userConfigContextValue = useUserConfigContext();
  const featureFlagsContextValue = useFeatureFlagsContext();
  const externalConfigContextValue =
    useExternalConfigContext(prefetchedManifest);

  const contextValue = useMemo(
    () => ({
      config: getConfig(),
      userConfig: userConfigContextValue,
      featureFlags: featureFlagsContextValue,
      externalConfig: externalConfigContextValue,
    }),
    [
      userConfigContextValue,
      featureFlagsContextValue,
      externalConfigContextValue,
    ],
  );

  return (
    <ConfigContext.Provider value={contextValue}>
      {children}
    </ConfigContext.Provider>
  );
};
