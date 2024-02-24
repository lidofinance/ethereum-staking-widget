import { PropsWithChildren, createContext } from 'react';

import { getOneConfig } from './utils';

export const OneConfigContext = createContext<any>(null);

export const OneConfigProvider = ({ children }: PropsWithChildren) => {
  // TODO: check object destructuring is fast or use memo?
  const contextValue = getOneConfig();

  return (
    <OneConfigContext.Provider value={contextValue}>
      {children}
    </OneConfigContext.Provider>
  );
};
