import { createContext, useContext, type ReactNode } from 'react';
import invariant from 'tiny-invariant';

import type { StakePath } from './stake-path';

const StakePathContext = createContext<StakePath | null>(null);
StakePathContext.displayName = 'StakePathContext';

type StakePathProviderProps = {
  path: StakePath;
  children: ReactNode;
};

export const StakePathProvider = ({
  path,
  children,
}: StakePathProviderProps) => (
  <StakePathContext.Provider value={path}>{children}</StakePathContext.Provider>
);

/** the /stake page being rendered */
export const useStakePath = () => {
  const path = useContext(StakePathContext);
  invariant(path, 'useStakePath was used outside the StakePathProvider');
  return path;
};
