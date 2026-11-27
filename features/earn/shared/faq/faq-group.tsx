import {
  createContext,
  useContext,
  useRef,
  type FC,
  type ReactNode,
} from 'react';

interface FaqGroupContextValue {
  activeItemHash: string;
  wasHashControlled: boolean;
}

const FaqGroupContext = createContext<FaqGroupContextValue>({
  activeItemHash: '',
  wasHashControlled: false,
});

export const useFaqGroup = () => useContext(FaqGroupContext);

export const FaqGroup: FC<{ activeItemHash: string; children: ReactNode }> = ({
  activeItemHash,
  children,
}) => {
  const wasHashControlledRef = useRef(false);
  if (activeItemHash) wasHashControlledRef.current = true;

  return (
    <FaqGroupContext.Provider
      value={{
        activeItemHash,
        wasHashControlled: wasHashControlledRef.current,
      }}
    >
      {children}
    </FaqGroupContext.Provider>
  );
};
