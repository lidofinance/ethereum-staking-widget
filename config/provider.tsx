import { PropsWithChildren, createContext } from 'react';

import { getConfig } from './get-config';

export const ConfigContext = createContext<any>(null);

export const ConfigProvider = ({ children }: PropsWithChildren) => {
  // TODO: check object destructuring is fast or use memo?
  const contextValue = getConfig();

  return (
    <ConfigContext.Provider value={contextValue}>
      {children}
    </ConfigContext.Provider>
  );
};
