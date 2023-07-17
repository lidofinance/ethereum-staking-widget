import { parseEther } from '@ethersproject/units';
import { TOKENS } from '@lido-sdk/constants';
import { BigNumber } from 'ethers';
import {
  Dispatch,
  FC,
  SetStateAction,
  createContext,
  useContext,
  useMemo,
  useState,
} from 'react';
import invariant from 'tiny-invariant';
import { isValidEtherValue } from 'utils/isValidEtherValue';

type TOKEN = TOKENS.STETH | TOKENS.WSTETH;

export type RequestFormContextValue = {
  inputValue: string;
  selectedToken: TOKEN;
  setSelectedToken: Dispatch<SetStateAction<TOKEN>>;
  isSteth: boolean;
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
  const [selectedToken, setSelectedToken] = useState<TOKEN>(TOKENS.STETH);
  const [inputValue, setInputValue] = useState('');
  const inputValueBN = useMemo(() => {
    if (isValidEtherValue(inputValue)) return parseEther(inputValue);
    return BigNumber.from(0);
  }, [inputValue]);
  const isSteth = selectedToken === TOKENS.STETH;

  const value = useMemo(
    () => ({
      inputValue,
      inputValueBN,
      setInputValue,
      selectedToken,
      isSteth,
      setSelectedToken,
    }),
    [inputValue, inputValueBN, isSteth, selectedToken],
  );

  return (
    <RequestFormContext.Provider value={value}>
      {children}
    </RequestFormContext.Provider>
  );
};
