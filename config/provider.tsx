import { PropsWithChildren, createContext, useMemo } from 'react';

import { getConfig, ConfigType } from './get-config';
import { useUserConfigContext, UserConfigContextType } from './user-config';
import {
  useFeatureFlagsContext,
  FeatureFlagsContextType,
} from './feature-flags';

type ConfigProviderType = {
  config: ConfigType;
  userConfig: UserConfigContextType;
  featureFlags: FeatureFlagsContextType;
};

export const ConfigContext = createContext<ConfigProviderType | null>(null);

export const ConfigProvider = ({ children }: PropsWithChildren) => {
  const userConfigContextValue = useUserConfigContext();
  const featureFlagsContextValue = useFeatureFlagsContext();

  const contextValue = useMemo(
    () => ({
      config: getConfig(),
      userConfig: userConfigContextValue,
      featureFlags: featureFlagsContextValue,
    }),
    [userConfigContextValue, featureFlagsContextValue],
  );

  return (
    <ConfigContext.Provider value={contextValue}>
      {children}
    </ConfigContext.Provider>
  );
};
