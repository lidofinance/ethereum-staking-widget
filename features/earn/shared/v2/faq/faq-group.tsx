import { createContext, useContext, type FC, type ReactNode } from 'react';

interface FaqGroupContextValue {
  activeItemHash: string;
}

const FaqGroupContext = createContext<FaqGroupContextValue>({
  activeItemHash: '',
});

export const useFaqGroup = () => useContext(FaqGroupContext);

export const FaqGroup: FC<{ activeItemHash: string; children: ReactNode }> = ({
  activeItemHash,
  children,
}) => (
  <FaqGroupContext.Provider value={{ activeItemHash }}>
    {children}
  </FaqGroupContext.Provider>
);
