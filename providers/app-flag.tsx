import {
  FC,
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useSearchParams } from 'react-router';
import invariant from 'tiny-invariant';

const AppFlagContext = createContext<string | undefined | null>(null);
AppFlagContext.displayName = 'AppFlagContext';

// This global state persists value of ?app= flag trough session even if query param gets lost
// used to track logic of integrations/embeddings
// e.g.Ledger Live before wallet info is available
export const AppFlagProvider: FC<PropsWithChildren> = ({ children }) => {
  const [searchParams] = useSearchParams();
  const appQueryParam = searchParams.get('app');
  const [appFlag, setAppFlag] = useState<string | undefined>(undefined);
  useEffect(() => {
    if (appQueryParam) {
      setAppFlag(appQueryParam);
    }
  }, [appQueryParam]);
  return (
    <AppFlagContext.Provider value={appFlag}>
      {children}
    </AppFlagContext.Provider>
  );
};

export const useAppFlag = () => {
  const value = useContext(AppFlagContext);
  invariant(
    value !== null,
    'useAppFlag was used used outside of AppFlagProvider',
  );
  return value;
};
