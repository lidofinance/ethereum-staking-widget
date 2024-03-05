import { PropsWithChildren, createContext } from 'react';

import { getConfig } from './get-config';

export const ConfigContext = createContext<any>(null);

export const ConfigProvider = ({ children }: PropsWithChildren) => {
  const contextValue = getConfig();

  return (
    <ConfigContext.Provider value={contextValue}>
      {children}
    </ConfigContext.Provider>
  );
};
