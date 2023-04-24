import { FC, createContext, useContext, useMemo, useState } from 'react';
import invariant from 'tiny-invariant';

export type RequestFormContextValue = {
  inputValue: string;
  setInputValue: (value: string) => void;
};
const RequestFormContext = createContext<RequestFormContextValue | null>(null);
RequestFormContext.displayName = 'RequestFormContext';

export const useRequestForm = () => {
  const value = useContext(RequestFormContext);
  invariant(value, 'useRequestForm was used outside RequestFormContext');
  return value;
};

export const RequestFormProvider: FC = ({ children }) => {
  const [inputValue, setInputValue] = useState('');

  const value = useMemo(
    () => ({
      inputValue,
      setInputValue,
    }),
    [inputValue, setInputValue],
  );

  return (
    <RequestFormContext.Provider value={value}>
      {children}
    </RequestFormContext.Provider>
  );
};
