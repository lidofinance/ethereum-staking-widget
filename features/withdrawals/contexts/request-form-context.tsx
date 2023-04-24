import { parseEther } from '@ethersproject/units';
import { BigNumber } from 'ethers';
import { FC, createContext, useContext, useMemo, useState } from 'react';
import invariant from 'tiny-invariant';

export type RequestFormContextValue = {
  inputValue: string;
  inputValueBN: BigNumber;
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
  const inputValueBN = useMemo(() => {
    try {
      return parseEther(inputValue ? inputValue : '0');
    } catch {
      return parseEther('0');
    }
  }, [inputValue]);
  const value = useMemo(
    () => ({
      inputValue,
      inputValueBN,
      setInputValue,
    }),
    [inputValue, inputValueBN, setInputValue],
  );

  return (
    <RequestFormContext.Provider value={value}>
      {children}
    </RequestFormContext.Provider>
  );
};
